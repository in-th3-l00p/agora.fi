import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import listingsRoutes from './routes/listings';
import offersRoutes from './routes/offers';
import { errorHandler } from './middleware/errors';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'marketplace-service' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/listings', listingsRoutes);
app.use('/offers', offersRoutes);

// Error handler
app.use(errorHandler);
