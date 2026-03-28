import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { verifyAdmin, verifyToken } from './middleware/authMiddleware.js'; 

const app = express();
const USER_SERVICE = 'http://localhost:8080';

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(['/api/users/login', '/api/users/register','/api/users/logout'], createProxyMiddleware({ 
    target: USER_SERVICE, 
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl
}));

// Protected Route
app.use('/api/users/promote-user', 
    verifyToken,  
    verifyAdmin,   
    createProxyMiddleware({ 
        target: USER_SERVICE, 
        changeOrigin: true,
        pathRewrite: (path, req) => req.originalUrl 
    })
);

app.listen(5001, () => console.log('Gateway running on PORT 5001'));