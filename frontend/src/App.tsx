import React, { FC, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/common/ScrollToTop";
import { TopLoader } from "@/components/common/TopLoader";
import { GlobalPopup } from "@/components/common/GlobalPopup";

import { StaffProvider } from "@/contexts/StaffContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

// Modular Route Components
import AdminRoutes from "@/routes/AdminRoutes";
import PublicRoutes from "@/routes/PublicRoutes";
import { StudentRoutes, StaffRoutes } from "@/routes/UserRoutes";

// Top-level lazy pages (kept here for clear entry point visibility)
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminSetup = lazy(() => import("@/pages/AdminSetup"));

/**
 * Loading Fallback for Suspense
 */
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    <p className="mt-4 text-muted-foreground animate-pulse font-medium">Loading school resources...</p>
  </div>
);

const App: FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <TopLoader />
      <SiteSettingsProvider>
        <GlobalPopup />
        <AuthProvider>
          <StaffProvider>
            <AdminProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Auth Entry Points */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/setup" element={<AdminSetup />} />

                  {/* Admin Portal */}
                  <Route path="/admin/*" element={<AdminRoutes />} />

                  {/* Student Portal */}
                  <Route path="/student/*" element={<StudentRoutes />} />

                  {/* Staff Portal */}
                  <Route path="/staff/*" element={<StaffRoutes />} />

                  {/* Public Site & Shared Pages */}
                  <Route path="/*" element={<PublicRoutes />} />
                </Routes>
              </Suspense>
            </AdminProvider>
          </StaffProvider>
        </AuthProvider>
      </SiteSettingsProvider>
      <Toaster />
    </Router>
  );
};

export default App;
