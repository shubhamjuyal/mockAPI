const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

//limiting each IP to 100 requests per 15 minutes.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

let mockEndpoints = [];

const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

function findMockEndpoint(method, path) {
    return mockEndpoints.find(endpoint => endpoint.method === method.toUpperCase() && endpoint.path.toLowerCase() === path.toLowerCase());
}

function validateMockRequest(req, res, next) {
    const { method, path, response } = req.body;

    if (!method || !path || !response) {
        return res.status(400).json({ error: 'method, path, and response are required' });
    }

    if (!validMethods.includes(method.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid HTTP method' });
    }

    const existingEndpoint = findMockEndpoint(method, path);
    if (existingEndpoint) {
        return res.status(400).json({ error: 'Endpoint already exists' });
    }

    next();
}

app.post('/mock', validateMockRequest, (req, res) => {
    const { method, path, response } = req.body;

    mockEndpoints.push({ method: method.toUpperCase(), path: path.toLowerCase(), response });
    res.status(201).json({ message: 'Mock endpoint created' });
});

app.get('/get-mock-endpoints', (req, res) => {
    if (!mockEndpoints.length) {
        return res.status(404).json({ error: 'No mock endpoints found, try creating one.' });
    }
    res.status(200).json({ endpoints: mockEndpoints });
});

app.delete('/mock', (req, res) => {
    const { method, path } = req.body;

    if (!method || !path) {
        return res.status(400).json({ error: 'method and path are required' });
    }

    const endpointIndex = mockEndpoints.findIndex(endpoint => endpoint.method === method.toUpperCase() && endpoint.path.toLowerCase() === path.toLowerCase());

    if (endpointIndex === -1) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }

    mockEndpoints.splice(endpointIndex, 1);
    res.status(200).json({ message: 'Mock endpoint deleted' });
});

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to MockAPI. You can create a mock endpoint using the following details:",
        example: {
            method: "POST",
            path: "/mock",
            body: {
                method: "GET",
                path: "/example",
                response: {
                    status: 200,
                    data: { message: "Hello, World!" }
                }
            }
        }
    });
});

app.all('*', (req, res) => {
    const endpoint = findMockEndpoint(req.method, req.path);
    if (endpoint) {
        return res.status(endpoint.response.status || 200).json(endpoint.response.data);
    }
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Service running on port: ${port}`);
});
