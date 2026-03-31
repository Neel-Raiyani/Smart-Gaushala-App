import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from '@middlewares/error.js';
import { setupAlertCron } from '@utils/cron.js';

const app = express();
const port = process.env.ALERT_PORT || 5007;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health Check (Public)
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'alert-service' });
});

app.get('/', (req, res) => {
    res.json({ status: 'UP', service: 'alert-service' });
});

// Routes
import alertRoutes from '@routes/alertRoutes.js';
app.use('/', alertRoutes);

// Background Jobs
setupAlertCron();

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`[alert-service]: Server is running at http://localhost:${port}`);
});
