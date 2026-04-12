import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { KitchenAuthContext } from "../context/KitchenAuthContext";

const KitchenProtectedRoute = ({ children }) => {
    const { kitchenUser, loading } = useContext(KitchenAuthContext);

    if (loading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0a0a0a",
                color: "#fff"
            }}>
                Loading Kitchen...
            </div>
        );
    }

    if (!kitchenUser) {
        return <Navigate to="/login?role=kitchen" replace />;
    }

    return children;
};

export default KitchenProtectedRoute;