import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "../hooks/UseRole"

const AdminRoute = () => {
    const { isAdmin } = useRole(); 

    console.log("🔍 Verificando acceso admin:", isAdmin);

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
