import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/error.js';
import breedingRoutes from './routes/breedingRoutes.js';

const app = express();
const port = process.env.BREEDING_PORT || 5005;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Breeding Service' });
});

app.use('/', breedingRoutes);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`[breeding-service]: Server is running at http://localhost:${port}`);
});
