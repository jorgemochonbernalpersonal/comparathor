import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { useRole } from "../../hooks/UseRole";
import { ROLES } from "../../utils/Constants";

const Register = () => {
    const navigate = useNavigate();
    const { register, currentUser } = useAuth();
    const { hasRole } = useRole();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const formFields = [
        { name: "name", label: "Nombre Completo", type: "text", required: true },
        { name: "email", label: "Correo Electrónico", type: "email", required: true },
        { name: "password", label: "Contraseña", type: "password", required: true },
    ];

    const handleSubmit = async (values, { setSubmitting }) => {
        setError("");
        setLoading(true);

        try {
            const response = await register({
                username: values.name,
                email: values.email,
                password: values.password,
                role: values.role || ROLES.REGISTERED, // Asegurar un rol predeterminado
            });

            if (!response || !response.accessToken || !response.refreshToken || !response.user) {
                throw new Error("No se recibieron datos válidos del servidor.");
            }

            console.log("✅ Usuario registrado:", response.user);
        } catch (err) {
            console.error("❌ Error en registro:", err.message);
            setError("Error al registrarse, revisa los datos e inténtalo de nuevo.");
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    // ⏳ Redirigir cuando el usuario se actualice correctamente
    useEffect(() => {
        if (currentUser) {
            if (hasRole(ROLES.ADMIN)) {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }
        }
    }, [currentUser, navigate, hasRole]);

    return (
        <div>
            {error && <div className="text-danger text-center small mb-2">{error}</div>}

            {loading ? (
                <div className="text-center">
                    <LoadingSpinner size="medium" color="#007bff" />
                </div>
            ) : (
                <AuthForm
                    title="📝 Crear Cuenta"
                    fields={formFields}
                    onSubmit={handleSubmit}
                    submitText="Registrarse"
                />
            )}
        </div>
    );
};

export default Register;
