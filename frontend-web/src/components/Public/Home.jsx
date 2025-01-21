import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container text-center mt-5">
            <h1 className="mb-4">Bienvenido a Nuestra Aplicación</h1>
            <p className="mb-4">
                Explora nuestras funcionalidades, gestiona productos, compara información, y mucho más.
            </p>
            <div className="d-flex justify-content-center gap-3">
                <Link to="/login" className="btn btn-primary">
                    Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-secondary">
                    Registrarse
                </Link>
            </div>
        </div>
    );
};

export default Home;
