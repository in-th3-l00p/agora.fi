import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import spacesRoutes from './routes/spaces';
import tilesRoutes from './routes/tiles';
import { errorHandler } from './middleware/errors';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'spaces-service' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/spaces', spacesRoutes);
app.use('/spaces', tilesRoutes);

// Error handler
app.use(errorHandler);
