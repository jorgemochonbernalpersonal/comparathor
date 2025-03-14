import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Form from "../shared/Form";
import { useAuth } from "../../hooks/UseAuth";
import { ROLES } from "../../utils/Constants";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);

    const initialValues = {
        email: "",
        password: "",
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Correo electrónico inválido.")
            .required("El correo electrónico es requerido."),
        password: Yup.string()
            .required("La contraseña es requerida.")
            .min(6, "La contraseña debe tener al menos 6 caracteres."),
    });

    const formFields = [
        { name: "email", label: "Correo Electrónico", type: "email" },
        { name: "password", label: "Contraseña", type: "password" },
    ];

    const handleSubmit = async (values, actions) => {
        try {
            const response = await login(values);
            const user = response?.user || null;

            const roleName = user?.role?.name || "";
            navigate(roleName === ROLES.ADMIN ? "/admin" : "/user");
        } catch (error) {
            let errorMsg = error?.response?.data?.message || error?.message || "❌ Error al procesar la solicitud.";
            setErrorMessage(errorMsg);
        } finally {
            actions.setSubmitting(false);
        }
    };
    
    return (
        <div>
        {errorMessage && (
            <div className="alert alert-danger text-center">
                {errorMessage}
            </div>
        )}
            <Form
                title="🔑 Iniciar Sesión"
                fields={formFields}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                submitText="Ingresar"
            />
        </div>
    );
};

export default Login;
