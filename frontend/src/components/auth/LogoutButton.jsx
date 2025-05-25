import React from "react";
import { useAuth } from "../../hooks/useAuth";

const LogoutButton = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <button onClick={logout} className="btn btn-danger">
            Cerrar Sesión
        </button>
    );
};

export default LogoutButton;
