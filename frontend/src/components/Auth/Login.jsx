import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { useRole } from "../../hooks/UseRole";

const Login = () => {
    const { login, currentUser, setIsAuthenticated } = useAuth();
    const { isAdmin } = useRole();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const formFields = [
        { name: "email", label: "Correo Electrónico", type: "email", required: true },
        { name: "password", label: "Contraseña", type: "password", required: true },
    ];

    const handleSubmit = async (values, { setSubmitting }) => {
        setError("");
        setLoading(true);
        try {
            const response = await login({
                email: values.email,
                password: values.password,
            });

            if (!response || !response.accessToken || !response.refreshToken) {
                throw new Error("No se recibieron tokens en la respuesta del servidor.");
            }

            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);
            localStorage.setItem("user", JSON.stringify(response.user));
            setIsAuthenticated(true);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
        setSubmitting(false);
    };

    useEffect(() => {
        if (currentUser) {
            if (isAdmin) {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        }
    }, [currentUser, isAdmin, navigate]);

    return (
        <div>
            <div>
                {error && <div className="error-message">{error}</div>}
                {loading ? <LoadingSpinner size="medium" color="#007BFF" /> : <AuthForm fields={formFields} onSubmit={handleSubmit} submitText="Ingresar" />}
            </div>
        </div>
    );
};

export default Login;
