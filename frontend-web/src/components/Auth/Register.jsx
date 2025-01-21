// src/components/Auth/Register.jsx
import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useRole } from '../../contexts/RoleContext'; 

const Register = () => {
    const { registerUser } = useUser();
    const { roles, loadRoles } = useRole(); 
    const navigate = useNavigate();

    const initialValues = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: '',
    };

    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .max(50, 'El nombre no puede exceder los 50 caracteres')
            .required('El nombre es obligatorio'),
        email: Yup.string()
            .email('Correo electrónico inválido')
            .required('El correo es obligatorio'),
        password: Yup.string()
            .min(6, 'La contraseña debe tener al menos 6 caracteres')
            .required('La contraseña es obligatoria'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
            .required('Debes confirmar la contraseña'),
        roleId: Yup.string().required('Selecciona un rol'),
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                await loadRoles(); 
            } catch (error) {
                console.error('Error cargando roles:', error.message);
            }
        };

        fetchRoles();
    }, [loadRoles]);

    // Función de envío del formulario
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        try {
            await registerUser({
                name: values.name,
                email: values.email,
                password: values.password,
                role_id: values.roleId, // Enviar el ID del rol seleccionado
            });

            alert('Usuario registrado con éxito');
            navigate('/login'); // Redirige al login después del registro
        } catch (error) {
            setErrors({ email: error.message }); // Mostrar error en el campo correspondiente
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <h1 className="text-center mb-4">Registro</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        {/* Campo: Nombre */}
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">
                                Nombre
                            </label>
                            <Field name="name" type="text" className="form-control" />
                            <ErrorMessage name="name" component="div" className="text-danger" />
                        </div>

                        {/* Campo: Email */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Correo Electrónico
                            </label>
                            <Field name="email" type="email" className="form-control" />
                            <ErrorMessage name="email" component="div" className="text-danger" />
                        </div>

                        {/* Campo: Contraseña */}
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                Contraseña
                            </label>
                            <Field name="password" type="password" className="form-control" />
                            <ErrorMessage name="password" component="div" className="text-danger" />
                        </div>

                        {/* Campo: Confirmar contraseña */}
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirmar Contraseña
                            </label>
                            <Field name="confirmPassword" type="password" className="form-control" />
                            <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                        </div>

                        {/* Campo: Rol */}
                        <div className="mb-3">
                            <label htmlFor="roleId" className="form-label">
                                Rol
                            </label>
                            <Field as="select" name="roleId" className="form-select">
                                <option value="">Selecciona un rol</option>
                                {roles && roles.length > 0 ? (
                                    roles.map((role) => (
                                        <option key={role._id} value={role._id}>
                                            {role.name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Cargando roles...</option>
                                )}
                            </Field>
                            <ErrorMessage name="roleId" component="div" className="text-danger" />
                        </div>

                        {/* Botón de envío */}
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Register;
