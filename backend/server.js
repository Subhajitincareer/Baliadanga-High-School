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

// Route files
import authRoutes from './routes/auth.js';
import items from './routes/items.js';
import admin from './routes/admin.js';
import resourceRoutes from './routes/resources.js';
import admissionRoutes from './routes/admissions.js';
import announcementRoutes from './routes/announcements.js';
import calendar from './routes/calendar.js';
import staffRoutes from './routes/staff.js';
import examRoutes from './routes/exam.js';
import resultRoutes from './routes/results.js';
import uploadRoutes from './routes/upload.js';
import routineRoutes from './routes/routine.js';
import studentRoutes from './routes/students.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import midDayMealRoutes from './routes/midDayMealRoutes.js';
import feeRoutes from './routes/fees.js';
import promotionRoutes from './routes/promotion.js';
import analyticsRoutes from './routes/analytics.js';
import homeworkRoutes from './routes/homework.js';

// ─── Startup ──────────────────────────────────────────────────────────────────
// Load env vars FIRST — must come before validateEnv and connectDB
dotenv.config();

// Validate all required env vars — exits with a clear error if any are missing
validateEnv();

// Connect to database
connectDB();

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();

// Trust proxy - required for secure cookies on Render/Vercel
app.set('trust proxy', 1);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Cookie parser — required for httpOnly JWT cookies
app.use(cookieParser());

// Enable CORS — credentials: true required for cookies to be sent cross-origin
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'https://baliadanga-high-school.vercel.app',
  'https://baliadanga-high-school.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────
// Global limiter: 100 req / 15 min per IP — applied to all API routes
// Login-specific limiter (5/15min) is applied in routes/auth.js directly
app.use('/api', globalLimiter);

// ─── Mount Routers ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/items', items);
app.use('/api/admin', admin);
app.use('/api/resources', resourceRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/calendar', calendar);
app.use('/api/staff', staffRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mid-day-meal', midDayMealRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/homework', homeworkRoutes);



// ─── Static & Utility Routes ─────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Baliadanga High Hub API 🚀',
    version: '1.0.0',
    endpoints: { auth: '/api/auth', health: '/health' },
    documentation: 'See README.md for API documentation'
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => { process.exit(1); });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  server.close(() => { console.log('Process terminated'); });
});