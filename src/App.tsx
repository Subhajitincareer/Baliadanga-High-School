import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import { AdminProvider } from "@/contexts/AdminContext";
import { Toaster } from "@/components/ui/toaster";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";

// Create a ProtectedRoute component to guard admin routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* Add more routes as needed */}
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </AdminProvider>
  );
};

export default App;
