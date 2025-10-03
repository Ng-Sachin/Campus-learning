import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  // Redirect all users to student dashboard by default
  // Admins can access admin dashboard via the Admin tab in navigation
  return <Navigate to="/student/dashboard" replace />;
};

export default Dashboard;