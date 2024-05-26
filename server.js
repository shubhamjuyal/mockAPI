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
        return res.status(400).json({ error: 'Method, path, and response are required' });
    }

    const existingEndpoint = findMockEndpoint(method, path);
    if (existingEndpoint) {
        return res.status(400).json({ error: 'Endpoint already exists' });
    }

    mockEndpoints.push({ method, path, response });
    res.status(201).json({ message: 'Mock endpoint created' });
});

app.all('*', (req, res) => {
    const endpoint = findMockEndpoint(req.method, req.path);
    if (endpoint) {
        return res.status(endpoint.response.status || 200).json(endpoint.response.body);
    }
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
    console.log(`service running on port: ${port}`);
});