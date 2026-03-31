import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from '@config/db.js';
import { errorHandler } from '@middlewares/error.js';
import animalRoutes from '@routes/animalRoutes.js';
import { initHeiferCron } from './services/cronService.js';

const app = express();
const port = process.env.ANIMAL_PORT || 5002;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/', animalRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Animal Service is healthy' });
});

// Initialize Cron Jobs
initHeiferCron();

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`[animal-service]: Server is running at http://localhost:${port}`);
});
