import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';

import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import designRoutes from './routes/designs';
import billingRoutes from './routes/billing';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/billing', billingRoutes);

const PORT = process.env.PORT || 3001;

// Health checks (and the server itself) shouldn't block on Mongo being
// reachable — DB-backed routes will simply error until MONGODB_URI is valid.
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
