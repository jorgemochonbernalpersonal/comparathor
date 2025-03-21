import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/admin/DashboardGrid.css";

const DashboardGrid = () => {
    const location = useLocation();

    return (
        <div className="dashboard-grid">
            <Link
                to="/admin/products"
                className={`dashboard-card blue ${location.pathname === "/admin/products" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-box-seam"></i>
                <h3>Productos</h3>
            </Link>

            <Link
                to="/admin/users"
                className={`dashboard-card dark-blue ${location.pathname === "/admin/users" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-people"></i>
                <h3>Usuarios</h3>
            </Link>

            <Link
                to="/admin/roles"
                className={`dashboard-card purple ${location.pathname === "/admin/roles" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-person-badge"></i>
                <h3>Roles</h3>
            </Link>

            <Link
                to="/admin/ratings"
                className={`dashboard-card teal ${location.pathname === "/admin/ratings" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-gear"></i>
                <h3>Ratings</h3>
            </Link>
        </div>
    );
};

export default DashboardGrid;
