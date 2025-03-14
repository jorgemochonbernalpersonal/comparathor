import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { translate } from "../../../../utils/Translate";
import Form from "../../../shared/Form";
import { useRole } from "../../../../hooks/UseRole";

const RoleForm = ({ role, onSave, setShowModal }) => {
    const { roles, loadRoles } = useRole();
    const roleId = role?.id || null;
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!roles || roles.length === 0) {
            loadRoles();
        }
    }, [loadRoles, roles.length]);

    const fields = [
        {
            name: "name",
            label: translate("admin.role.form.name"),
            type: "text",
        },
        {
            name: "description",
            label: translate("admin.role.form.description"),
            type: "textarea",
            rows: 4,
        }
    ];

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, translate("admin.role.form.errors.nameMin"))
            .required(translate("admin.role.form.errors.nameRequired")),
        description: Yup.string()
            .max(500, translate("admin.role.form.errors.descriptionMax"))
            .notRequired(),
    });

    const initialValues = {
        name: role?.name || "",
        description: role?.description || "",
    };

    const handleSubmit = async (values, actions) => {
        setErrorMessage(null);
        actions.setSubmitting(true);

        try {
            const response = await onSave(values, roleId);
            if (!response) {
                throw new Error("❌ No se recibió respuesta del servidor.");
            }
            toast.success(roleId ? "✅ Rol actualizado con éxito" : "✅ Rol creado con éxito");

            setTimeout(() => {
                if (typeof setShowModal === "function") {
                    setShowModal(false);
                }
                actions.resetForm();
            }, 500);
        } catch (error) {
            let errorMsg = error?.response?.data?.message || error?.message || "❌ Error al procesar la solicitud.";
            errorMsg = errorMsg.replace(/^Error \d+: /, ""); 
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
                submitText={roleId ? translate("admin.role.form.saveChanges") : translate("admin.role.form.createRole")}
            />
        </div>
    );
};

export default RoleForm;
