import React from "react";
import { Link, useLocation } from "react-router-dom";
import { translate } from "../../utils/Translate"; 
import "../../styles/registered/RegisteredDashboard.css";

const RegisteredDashboard = () => {
    const location = useLocation();

    return (
        <div className="dashboard-grid">
            <Link
                to="/user/products"
                className={`dashboard-card blue ${location.pathname === "/user/products" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-box"></i>
                <h3>{translate("registered.dashboard.products", { defaultValue: "Products" })}</h3>
            </Link>

            <Link
                to="/user/comparisons"
                className={`dashboard-card green ${location.pathname === "/user/comparisons" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-bar-chart"></i>
                <h3>{translate("registered.dashboard.comparisons", { defaultValue: "Comparisons" })}</h3>
            </Link>

            <Link
                to="/user/ratings"
                className={`dashboard-card purple ${location.pathname === "/user/ratings" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-star"></i>
                <h3>{translate("registered.dashboard.ratings", { defaultValue: "Ratings" })}</h3>
            </Link>

            <Link
                to="/user/profile"
                className={`dashboard-card teal ${location.pathname === "/user/profile" ? "active-card" : "inactive-card"}`}
            >
                <i className="bi bi-person"></i>
                <h3>{translate("registered.dashboard.profile", { defaultValue: "My Profile" })}</h3>
            </Link>
        </div>
    );
};

export default RegisteredDashboard;
