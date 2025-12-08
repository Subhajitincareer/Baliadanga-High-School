import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// Route files
import auth from './routes/auth.js';
import items from './routes/items.js';
import admin from './routes/admin.js';
import resources from './routes/resources.js';
import admissions from './routes/admissions.js';
import announcements from './routes/announcements.js';
import calendar from './routes/calendar.js'; // Import calendar routes
import staff from './routes/staff.js'; // Import staff routes

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Mount routers
app.use('/api/auth', auth);
app.use('/api/items', items);
app.use('/api/admin', admin);
app.use('/api/resources', resources);
app.use('/api/admissions', admissions);
app.use('/api/announcements', announcements);
app.use('/api/calendar', calendar); // Mount calendar routes
app.use('/api/staff', staff); // Mount staff routes

// Serve static assets (uploads)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MERN Backend API 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      health: '/health'
    },
    documentation: 'See README.md for API documentation'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  server.close(() => {
    console.log('Process terminated');
  });
});