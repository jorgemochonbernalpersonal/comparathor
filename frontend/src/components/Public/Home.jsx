import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FaCheckCircle, FaBell, FaStar, FaSearch } from "react-icons/fa";
import "../../styles/global.css";

const Home = () => {
    const { user } = useAuth(); 

    return (
        <div className="container d-flex flex-column align-items-center">
            <div className="home-container">
                <h1 className="home-title">Bienvenido a Comparathor 🦾</h1>
                <p className="home-description">
                    La mejor plataforma para comparar productos y tomar decisiones inteligentes.
                </p>

                <div className="mt-4 feature-list">
                    <h2 className="mb-3">🔍 ¿Qué puedes hacer aquí?</h2>
                    <ul className="list-group">
                        <li className="list-group-item feature-item">
                            <FaCheckCircle /> Comparar productos de diferentes marcas.
                        </li>
                        <li className="list-group-item feature-item">
                            <FaStar /> Ver puntuaciones y reseñas de otros usuarios.
                        </li>
                        <li className="list-group-item feature-item">
                            <FaBell /> Recibir notificaciones sobre productos recomendados.
                        </li>
                        <li className="list-group-item feature-item">
                            <FaSearch /> Filtrar productos según tus necesidades.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Home;
