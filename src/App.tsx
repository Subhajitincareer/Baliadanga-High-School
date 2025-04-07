
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Announcements from "./pages/Announcements";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Staff from "./pages/Staff";
import Resources from "./pages/Resources";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";
import { AdminProvider } from "./contexts/AdminContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route index element={<Index />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="courses" element={<Courses />} />
              <Route path="events" element={<Events />} />
              <Route path="staff" element={<Staff />} />
              <Route path="resources" element={<Resources />} />
              <Route path="portal" element={<Portal />} />
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
