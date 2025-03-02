import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RegisteredRoute = () => {
    const { user } = useAuth();

    return user?.role === "registered" ? <Outlet /> : <Navigate to="/unauthorized" />;
};

export default RegisteredRoute;
