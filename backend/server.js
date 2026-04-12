import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Config & middleware
import connectDB from './config/db.js';
import { validateEnv } from './config/envValidation.js';
import errorHandler from './middlewares/errorHandler.js';
import { globalLimiter } from './middlewares/rateLimiter.js';

// Central Router
import apiRouter from './routes/index.js';

// ─── Pre-flight ─────────────────────────────────────────────────────────────
dotenv.config();
validateEnv();

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────────────
// 1. Logger - Move to top to catch all requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Trust proxy - required for secure cookies on Render/Vercel
app.set('trust proxy', 1);

// 3. CORS - Hardened origin check
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://baliadanga-high-school.vercel.app',
  'https://baliadanga-high-school.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check for exact match or allowed localhosts in dev
    const isAllowed = allowedOrigins.includes(origin) || 
                     (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:'));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS Blocking: Origin unauthorized'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 4. Body parsers - Lower global limit (100kb is standard for JSON)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// 5. Cookie parser
app.use(cookieParser());

// ─── Rate Limiting ───────────────────────────────────────────────────────────
// Apply global limiter to all API routes
app.use('/api', globalLimiter);

// ─── Route Mounting ─────────────────────────────────────────────────────────
// Mount consolidated API router
app.use('/api', apiRouter);

// Utility Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Baliadanga High Hub API 🚀',
    version: '1.2.0',
    documentation: 'See project README.md for endpoint details'
  });
});

// ─── Static Files (Optional) ────────────────────────────────────────────────
// Note: In production (Render/Vercel), local disk is ephemeral. 
// Use cloud storage (ImageKit/Cloudinary) for persistent file uploads.
if (process.env.NODE_ENV === 'development') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ─── Error Handling ──────────────────────────────────────────────────────────
// Final middleware to catch all errors
app.use(errorHandler);

// ─── Server Startup ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Ensure DB is connected before starting listener
    await connectDB();
    console.log('📦 Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle abrupt shutdowns
    process.on('unhandledRejection', (err) => {
      console.error(`💥 Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully.');
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();