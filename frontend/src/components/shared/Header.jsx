import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaHome,
    FaSignInAlt,
    FaUserPlus,
    FaUser,
    FaPowerOff,
    FaCog
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useRole } from "../../hooks/UseRole";
import "../../styles/Header.css";

const Header = () => {
    const { currentUser, logout } = useAuth();
    const { hasRole } = useRole();
    const userName = useMemo(() => currentUser?.name || "Usuario", [currentUser]);
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
            <div className="container">
                <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
                    Comparathor <span className="robot-icon">⚡</span>
                </Link>

                <button
                    className="navbar-toggler custom-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse fade-in" id="navbarNav">
                    <ul className="navbar-nav ms-auto gap-3">
                        {!currentUser && (
                            <li className="nav-item">
                                <Link
                                    className={`nav-link custom-link ${location.pathname === "/" ? "active-link" : ""}`}
                                    to="/"
                                >
                                    <FaHome className="me-2" /> Inicio
                                </Link>
                            </li>
                        )}

                        {currentUser ? (
                            <>
                                {hasRole("ROLE_ADMIN") && (
                                    <li className="nav-item">
                                        <Link
                                            className={`nav-link custom-link ${location.pathname.startsWith("/admin") ? "active-link" : ""}`}
                                            to="/admin"
                                        >
                                            <FaCog className="me-2" /> Panel Admin
                                        </Link>
                                    </li>
                                )}

                                <li className="nav-item">
                                    <Link
                                        className={`nav-link custom-link ${location.pathname === "/dashboard" ? "active-link" : ""}`}
                                        to="/dashboard"
                                    >
                                        <FaUser className="me-2" /> {userName}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="nav-link btn btn-link custom-logout"
                                        onClick={logout}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <FaPowerOff className="me-2" /> Cerrar Sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link custom-link ${location.pathname === "/login" ? "active-link" : ""}`}
                                        to="/login"
                                    >
                                        <FaSignInAlt className="me-2" /> Iniciar Sesión
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link custom-link ${location.pathname === "/register" ? "active-link" : ""}`}
                                        to="/register"
                                    >
                                        <FaUserPlus className="me-2" /> Registrarse
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
