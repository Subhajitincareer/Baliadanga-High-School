import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";

// Lazy-loaded components
const Index = lazy(() => import("@/pages/Index"));
const Announcements = lazy(() => import("@/pages/Announcements"));
const AnnouncementDetail = lazy(() => import("@/pages/AnnouncementDetail"));
const Courses = lazy(() => import("@/pages/Courses"));
const Resources = lazy(() => import("@/pages/Resources"));
const Events = lazy(() => import("@/pages/Events"));
const Staff = lazy(() => import("@/pages/Staff"));
const Portal = lazy(() => import("@/pages/Portal"));
const Contact = lazy(() => import("@/pages/Contact"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const AcademicCalendar = lazy(() => import("@/pages/AcademicCalendar"));
const Admission = lazy(() => import("@/pages/Admission"));
const AdmissionStatus = lazy(() => import("@/pages/AdmissionStatus"));
const RoutinePage = lazy(() => import("@/pages/Routine"));
const ResultDisplay = lazy(() => import("@/pages/ResultDisplay"));
const MidMealSummaryPage = lazy(() => import("@/pages/MidMealSummaryPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="announcements/:id" element={<AnnouncementDetail />} />
        <Route path="courses" element={<Courses />} />
        <Route path="resources" element={<Resources />} />
        <Route path="events" element={<Events />} />
        <Route path="staff" element={<Staff />} />
        <Route path="portal" element={<Portal />} />
        <Route path="contact" element={<Contact />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="academic-calendar" element={<AcademicCalendar />} />
        <Route path="admission" element={<Admission />} />
        <Route path="admission-status" element={<AdmissionStatus />} />
        <Route path="routine" element={<RoutinePage />} />
        <Route path="results" element={<ResultDisplay />} />
        <Route path="mid-meal" element={<MidMealSummaryPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default PublicRoutes;
