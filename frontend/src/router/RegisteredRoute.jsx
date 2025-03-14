import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { ROLES } from "../utils/Constants";

const RegisteredRoute = () => {
    const { user, isUser } = useAuth(); 

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!isUser) {
        return <Navigate to="/unauthorized" />; 
    }

    return <Outlet />; 
};

export default RegisteredRoute;
