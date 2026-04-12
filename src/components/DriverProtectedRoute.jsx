import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { DriverAuthContext } from '../context/DriverAuthContext';

const DriverProtectedRoute = ({ children }) => {
    const { driver, loading } = useContext(DriverAuthContext);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!driver) {
        return <Navigate to="/driver/login" />;
    }

    return children;
};

export default DriverProtectedRoute;
