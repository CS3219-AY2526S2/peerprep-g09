const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use(['/api/users/register'], createProxyMiddleware({ 
    target: 'http://localhost:8080', 
    changeOrigin: true
}));

app.listen(5000, () => console.log('Gateway running on PORT 5000'));