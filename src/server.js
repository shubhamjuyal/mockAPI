const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

let mockEndpoints = [];

function findMockEndpoint(method, path) {
    return mockEndpoints.find(endpoint => endpoint.method === method && endpoint.path === path);
}

app.post('/mock', (req, res) => {
    const { method, path, response } = req.body;

    if (!method || !path || !response) {
        return res.status(400).json({ error: 'method, path, and response are required' });
    }

    const existingEndpoint = findMockEndpoint(method, path);
    if (existingEndpoint) {
        return res.status(400).json({ error: 'endpoint already exists' });
    }

    mockEndpoints.push({ method, path, response });
    res.status(201).json({ message: 'mock endpoint created' });
});

app.get('/get-mock-endpoints', (req, res) => {
    if (!mockEndpoints.length) {
        return res.status(404).json({ error: "no mock endpoint found, try creating one." });
    }
    res.status(200).json(mockEndpoints);
});

app.get('/', (req, res) => {
    return res.status(200).json(
        {
            "message": "welcome to mockApi, try creating one by calling the following endpoint.",
            "endpoint": {
                "method": "POST",
                "path": "/mock",
                "response": {
                    "status": "number",
                    // "message": "string",
                    "data": "any"
                }
            }
        }
    )
});

app.all('*', (req, res) => {
    const endpoint = findMockEndpoint(req.method, req.path);
    if (endpoint) {
        return res.status(endpoint.response.status || 200).json(endpoint.response.data);
    }
    res.status(404).json({ error: 'endpoint not found' });
});

app.listen(port, () => {
    console.log(`service running on port: ${port}`);
});