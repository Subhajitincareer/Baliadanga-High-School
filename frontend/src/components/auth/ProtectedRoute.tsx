import React, { FC } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roleRequirement: 'admin' | 'student' | 'staff';
}

/**
 * A generic protected route component that handles authentication and role authorization.
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, roleRequirement }) => {
  const { isAuthenticated, isAdmin, isStudent, isStaff, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg font-medium">Checking session...</span>
      </div>
    );
  }

  const roleChecks = {
    admin: isAdmin,
    student: isStudent,
    staff: isStaff
  };

  const hasAccess = isAuthenticated && roleChecks[roleRequirement];

  if (!hasAccess) {
    const redirectPath = roleRequirement === 'admin' 
      ? '/admin' 
      : `/${roleRequirement}/login`;
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
