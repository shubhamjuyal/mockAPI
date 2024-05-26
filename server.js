const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

let mockEndpoints = [];

function findMockEndpoint(method, path) {
    return mockEndpoints.find(endpoint => endpoint.method === method && endpoint.path === path);
}

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