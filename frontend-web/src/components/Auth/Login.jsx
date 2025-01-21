// src/components/Auth/Login.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Login = () => {
    const { login } = useUser();
    const navigate = useNavigate();

    const initialValues = { email: '', password: '' };

    const validationSchema = Yup.object({
        email: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
        password: Yup.string().required('La contraseña es obligatoria'),
    });

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        try {
            const user = await login(values); 
            if (user) {
                alert('Inicio de sesión exitoso');
                navigate('/home'); 
            }
        } catch (error) {
            setErrors({ email: 'Credenciales incorrectas' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form className="container mt-5" style={{ maxWidth: '400px' }}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Correo Electrónico
                        </label>
                        <Field name="email" type="email" className="form-control" />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Contraseña
                        </label>
                        <Field name="password" type="password" className="form-control" />
                        <ErrorMessage name="password" component="div" className="text-danger" />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default Login;
