import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const ProtectedRoute = ({ children, role }) => {
    const { currentUser } = useUser();

    if (!currentUser || !currentUser.isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (role && currentUser.role !== role) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
