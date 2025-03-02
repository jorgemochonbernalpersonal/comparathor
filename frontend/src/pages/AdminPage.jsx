import React from "react";
import { Outlet } from "react-router-dom";
import DashboardGrid from "../components/admin/DashboardGrid";

const AdminPage = () => {
    return (
        <div className="admin-page">
            <main className="main-content text-center mt-5">
            <h2>Panel de Administración</h2>
                <DashboardGrid />
                <Outlet />
            </main>
        </div>
    );
};

export default AdminPage;
