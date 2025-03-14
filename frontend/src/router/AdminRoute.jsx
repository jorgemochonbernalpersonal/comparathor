import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { ROLES } from "../utils/Constants";

const AdminRoute = () => {
    const { user, isAdmin } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
};

export default AdminRoute;
