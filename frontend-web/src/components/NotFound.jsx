// src/components/Shared/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <h1 className="display-1 text-danger">404</h1>
            <h2 className="text-dark mb-4">Página No Encontrada</h2>
            <p className="text-muted mb-4 text-center">
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
            <Link to="/home" className="btn btn-primary">
                Volver al Inicio
            </Link>
        </div>
    );
};

export default NotFound;
