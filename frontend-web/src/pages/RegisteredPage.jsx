// src/pages/RegisterPage.jsx
import React from 'react';
import Register from '../components/Auth/Register';

const RegisterPage = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="p-4 bg-white rounded shadow" style={{ width: '100%', maxWidth: '500px' }}>
        <h1 className="text-center mb-3">Crea tu Cuenta</h1>
        <p className="text-center text-muted mb-4">
          Completa el formulario para registrarte en nuestra plataforma.
        </p>
        <Register />
        <p className="text-center mt-4">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="text-decoration-none">
            Inicia Sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
