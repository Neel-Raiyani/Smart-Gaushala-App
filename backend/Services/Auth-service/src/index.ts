import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from '@middlewares/error.js';
import authRoutes from '@routes/authRoutes.js';

const app = express();
const port = process.env.AUTH_PORT || 5001;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health Check (Public)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'auth-service' });
});

app.get('/', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'auth-service' });
});

app.use('/', authRoutes);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`[auth-service]: Server is running at http://localhost:${port}`);
});
