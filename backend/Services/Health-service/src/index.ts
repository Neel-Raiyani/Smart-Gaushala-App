import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from '@middlewares/error.js';

const app = express();
const port = process.env.HEALTH_PORT || 5003;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health Check (Public)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'health-service' });
});

app.get('/', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'health-service' });
});

// Routes
import healthRoutes from '@routes/healthRoutes.js';
app.use('/', healthRoutes);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`[health-service]: Server is running at http://localhost:${port}`);
});
