import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import Form from "../../../shared/Form";
import { translate } from "../../../../utils/Translate";
import { useRole } from "../../../../hooks/UseRole";

const UserForm = ({ user, onSave, setShowModal }) => {
    const { roles, loadRoles } = useRole();
    const userId = user?.id || null;
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!roles || roles.length === 0) {
            loadRoles();
        }
    }, [loadRoles, roles.length]);

    const fields = [
        {
            name: "name",
            label: translate("admin.user.form.name"),
            type: "text",
        },
        {
            name: "email",
            label: translate("admin.user.form.email"),
            type: "email",
        },
        !userId && {
            name: "password",
            label: translate("admin.user.form.password"),
            type: "password",
        },
        {
            name: "roleId",
            label: translate("admin.user.form.role"),
            type: "select",
            options: [
                { value: "", label: translate("admin.user.form.selectRole") },
                ...roles.map(role => ({
                    value: String(role.id || role._id),
                    label: role.name,
                })),
            ],
        }
    ].filter(Boolean);

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required(translate("admin.user.form.validation.name")),
        email: Yup.string()
            .email(translate("admin.user.form.validation.emailInvalid"))
            .required(translate("admin.user.form.validation.email")),
        password: Yup.string()
            .nullable()
            .test(
                "password-required",
                translate("admin.user.form.validation.password"),
                function (value) {
                    if (!userId && (!value || value.length < 6)) {
                        return false;
                    }
                    return true;
                }
            ),
        roleId: Yup.string()
            .required(translate("admin.user.form.validation.role")),
    });

    const initialValues = {
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        roleId: user?.role?.id ? String(user.role.id) : "", 
    };
    
    const handleSubmit = async (values, actions) => {
        setErrorMessage(null);
        actions.setSubmitting(true);

        try {
            const response = await onSave(values, user?.id);
            if (!response) {
                throw new Error("No se recibió respuesta del servidor.");
            }
            setTimeout(() => {
                if (typeof setShowModal === "function") {
                    setShowModal(false);
                }
                actions.resetForm();
            }, 500);

        } catch (error) {
            let errorMsg = error?.response || "Error al procesar la solicitud.";
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
                fields={fields}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                submitText={userId ? translate("admin.user.form.saveChanges") : translate("admin.user.form.createUser")}
            />
        </div>
    );
};

export default UserForm;
