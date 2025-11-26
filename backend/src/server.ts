/**
 * Express Server
 * Main entry point for the backend API
 */

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import hospitalRoutes from './modules/hospitals/hospital.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://mediguardia.vercel.app'
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediGuardia Backend API is running' });
});

// API Routes
app.use('/api/hospitals', hospitalRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.path} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MediGuardia Backend API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🏥 Hospitals API: http://localhost:${PORT}/api/hospitals`);
});

export default app;

