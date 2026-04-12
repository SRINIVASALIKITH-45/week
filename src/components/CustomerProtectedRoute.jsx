import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { CustomerAuthContext } from '../context/CustomerAuthContext';

const CustomerProtectedRoute = ({ children }) => {
  const { customer, loading } = useContext(CustomerAuthContext);

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;
  }

  if (!customer) {
    return <Navigate to="/customer-login" replace />;
  }

  return children;
};

export default CustomerProtectedRoute;
