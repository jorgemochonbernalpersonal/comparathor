import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Form from "../shared/Form";
import { useAuth } from "../../hooks/UseAuth";

const Register = () => {
    const { register, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);

    const initialValues = {
        name: "",
        email: "",
        password: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, "El nombre debe tener al menos 2 caracteres.")
            .required("El nombre es requerido."),
        email: Yup.string()
            .email("Correo electrónico inválido.")
            .required("El correo electrónico es requerido."),
        password: Yup.string()
            .required("La contraseña es requerida.")
            .min(6, "La contraseña debe tener al menos 6 caracteres."),
    });

    const formFields = [
        { name: "name", label: "Nombre Completo", type: "text" },
        { name: "email", label: "Correo Electrónico", type: "email" },
        { name: "password", label: "Contraseña", type: "password" },
    ];

    const handleSubmit = async (values, actions) => {
        try {
            await register(values);
        } catch (error) {
            let errorMsg = error?.response?.data?.message || error?.message || "❌ Error al procesar la solicitud.";
            setErrorMessage(errorMsg);
        } finally {
            actions.setSubmitting(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate(isAdmin ? "/admin" : "/dashboard");
        }
    }, [isAuthenticated, isAdmin, navigate]);

    return (
        <div>
            {errorMessage && (
                <div className="alert alert-danger text-center">
                    {errorMessage}
                </div>
            )}
            <Form
                title="📝 Registro de Usuario"
                fields={formFields}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                submitText="Registrarse"
            />
        </div>
    );
};

export default Register;
