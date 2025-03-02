import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useUser } from "../../../contexts/UserContext";
import { useRole } from "../../../contexts/RoleContext";

const UserForm = ({ user, onSave }) => {
    const { registerUser, updateUserById, loadUsers } = useUser();
    const { roles, loadRoles } = useRole();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (roles.length === 0) {
            loadRoles();
        }
    }, [roles, loadRoles]);

    const initialValues = {
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        roleId: user?.role_id || "",
    };

    const validationSchema = Yup.object({
        name: Yup.string().min(2, "Mínimo 2 caracteres").required("Nombre obligatorio"),
        email: Yup.string().email("Correo inválido").required("Correo obligatorio"),
        password: Yup.string()
            .min(6, "Mínimo 6 caracteres")
            .when("roleId", {
                is: (value) => !user,
                then: (schema) => schema.required("Contraseña obligatoria"),
                otherwise: (schema) => schema.notRequired(),
            }),
        roleId: Yup.string().required("Selecciona un rol"),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        setSubmitting(true);
        setErrorMessage("");

        try {
            const userPayload = {
                name: values.name.trim(),
                email: values.email.trim(),
                password: values.password ? values.password.trim() : undefined,
                role_id: values.roleId,
            };

            if (!userPayload.name || !userPayload.email || !userPayload.role_id) {
                throw new Error("Todos los campos obligatorios deben ser completados.");
            }

            await onSave(userPayload, user?._id);

        } catch (error) {
            console.error("❌ Error al guardar usuario:", error);
            setErrorMessage(error.message || "Error al procesar la solicitud.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nombre</label>
                            <Field name="name" type="text" className="form-control" />
                            <ErrorMessage name="name" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Correo</label>
                            <Field name="email" type="email" className="form-control" />
                            <ErrorMessage name="email" component="div" className="text-danger" />
                        </div>

                        {!user && (
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                                <Field name="password" type="password" className="form-control" />
                                <ErrorMessage name="password" component="div" className="text-danger" />
                            </div>
                        )}

                        <div className="mb-3">
                            <label htmlFor="roleId" className="form-label">Rol</label>
                            <Field as="select" name="roleId" className="form-select">
                                <option value="">Selecciona un rol</option>
                                {roles.map((role) => (
                                    <option key={role._id} value={role._id}>
                                        {role.role}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="roleId" component="div" className="text-danger" />
                        </div>

                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-success me-2" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : user ? "Guardar Cambios" : "Crear Usuario"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => onSave(null)}>
                                Cancelar
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UserForm;
