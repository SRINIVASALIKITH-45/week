import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { WriterAuthContext } from '../context/WriterAuthContext';

const WriterProtectedRoute = ({ children }) => {
    const { writer, loading } = useContext(WriterAuthContext);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader">Loading Captain Profile...</div>
            </div>
        );
    }

    if (!writer) {
        return <Navigate to="/login?role=writer" replace />;
    }

    return children;
};

export default WriterProtectedRoute;
