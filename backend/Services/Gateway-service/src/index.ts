import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'gateway' });
});

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Cattle Management System API Gateway is running',
        docs: '/docs',
        health: '/health'
    });
});

// Proxy Error Handler
const onProxyError = (err: any, req: any, res: any) => {
    console.error(`[gateway-error]: Proxy error for ${req.url}:`, err.message);
    res.status(504).json({
        error: 'Gateway Timeout',
        message: 'The backend service is currently unreachable. Please try again later.',
        detail: err.message
    });
};

// Proxy Routes
app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    changeOrigin: true,
    on: { error: onProxyError }
}));

// Animal Service Proxy
app.use('/api/animal', createProxyMiddleware({
    target: process.env.ANIMAL_SERVICE_URL || 'http://localhost:5002',
    changeOrigin: true,
    on: { error: onProxyError }
}));

// Health Service Proxy
app.use('/api/health', createProxyMiddleware({
    target: process.env.HEALTH_SERVICE_URL || 'http://localhost:5003',
    changeOrigin: true,
    on: { error: onProxyError }
}));

// Production Service Proxy
app.use('/api/production', createProxyMiddleware({
    target: process.env.PRODUCTION_SERVICE_URL || 'http://localhost:5004',
    changeOrigin: true,
    on: { error: onProxyError }
}));

// Breeding Service Proxy
app.use('/api/breeding', createProxyMiddleware({
    target: process.env.BREEDING_SERVICE_URL || 'http://localhost:5005',
    changeOrigin: true,
    on: { error: onProxyError }
}));

// Media Service Proxy
app.use('/api/media', createProxyMiddleware({
    target: process.env.MEDIA_SERVICE_URL || 'http://localhost:5006',
    changeOrigin: true,
    on: { error: onProxyError }
}));

// Alert Service Proxy
app.use('/api/alert', createProxyMiddleware({
    target: process.env.ALERT_SERVICE_URL || 'http://localhost:5007',
    changeOrigin: true,
    on: { error: onProxyError }
}));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested route does not exist on the Gateway.' });
});

app.listen(port, () => {
    console.log(`[gateway-service]: Gateway is running at http://localhost:${port}`);
});
