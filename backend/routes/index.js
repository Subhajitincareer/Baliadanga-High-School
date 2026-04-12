import express from 'express';
const router = express.Router();

// Import Route files
import authRoutes from './auth.js';
import items from './items.js';
import admin from './admin.js';
import resourceRoutes from './resources.js';
import admissionRoutes from './admissions.js';
import announcementRoutes from './announcements.js';
import calendar from './calendar.js';
import staffRoutes from './staff.js';
import examRoutes from './exam.js';
import resultRoutes from './results.js';
import uploadRoutes from './upload.js';
import routineRoutes from './routine.js';
import studentRoutes from './students.js';
import attendanceRoutes from './attendanceRoutes.js';
import midDayMealRoutes from './midDayMealRoutes.js';
import feeRoutes from './fees.js';
import promotionRoutes from './promotion.js';
import analyticsRoutes from './analytics.js';
import homeworkRoutes from './homework.js';
import siteSettingsRoutes from './siteSettings.js';
import courseMaterialRoutes from './courseMaterials.js';
import eventRoutes from './events.js';
import galleryRoutes from './gallery.js';

// Mount Routers
router.use('/auth', authRoutes);
router.use('/items', items);
router.use('/admin', admin);
router.use('/resources', resourceRoutes);
router.use('/admissions', admissionRoutes);
router.use('/announcements', announcementRoutes);
router.use('/calendar', calendar);
router.use('/staff', staffRoutes);
router.use('/exams', examRoutes);
router.use('/results', resultRoutes);
router.use('/upload', uploadRoutes);
router.use('/routines', routineRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/mid-day-meal', midDayMealRoutes);
router.use('/fees', feeRoutes);
router.use('/promotion', promotionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/homework', homeworkRoutes);
router.use('/site-settings', siteSettingsRoutes);
router.use('/course-materials', courseMaterialRoutes);
router.use('/events', eventRoutes);
router.use('/gallery', galleryRoutes);

export default router;
