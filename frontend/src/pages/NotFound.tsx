import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center border border-red-400">
        <h1 className="text-5xl font-extrabold text-red-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-4">🚨 Oops! Page not found</p>
        <a href="/" className="inline-block mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition">
          Return to Home
        </a>
      </div>
    </div>
  );
  
};

export default NotFound;
