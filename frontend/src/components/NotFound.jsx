import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404</h1>
            <p className="not-found-message">Oops! Página no encontrada.</p>
            <Link to="/" className="not-found-link">
                🔙 Volver al Inicio
            </Link>
        </div>
    );
};

export default NotFound;
