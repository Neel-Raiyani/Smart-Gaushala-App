import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from '@middlewares/error.js';

const app = express();
const port = process.env.PRODUCTION_PORT || 5004;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health Check (Public)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'production-service' });
});

app.get('/', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'production-service' });
});

// Routes
import productionRoutes from '@routes/productionRoutes.js';
app.use('/', productionRoutes);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`[production-service]: Server is running at http://localhost:${port}`);
});
