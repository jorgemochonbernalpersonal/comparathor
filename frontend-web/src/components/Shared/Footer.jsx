// src/components/Shared/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-light py-3">
            <div className="container text-center">
                <p className="mb-1">&copy; {new Date().getFullYear()} Mi App. Todos los derechos reservados.</p>
                <ul className="list-inline">
                    <li className="list-inline-item">
                        <a href="/privacy-policy" className="text-decoration-none">
                            Política de Privacidad
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/terms" className="text-decoration-none">
                            Términos de Servicio
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/contact" className="text-decoration-none">
                            Contacto
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
