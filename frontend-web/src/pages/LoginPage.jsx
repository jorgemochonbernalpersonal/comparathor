// src/pages/LoginPage.jsx
import React from 'react';
import Login from '../components/Auth/Login';

const LoginPage = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="p-4 bg-white rounded shadow" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="text-center mb-3">Bienvenido</h1>
                <p className="text-center text-muted mb-4">Por favor, inicia sesión para continuar.</p>
                <Login />
            </div>
        </div>
    );
};

export default LoginPage;
