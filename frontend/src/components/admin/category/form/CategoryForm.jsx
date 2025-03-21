import React, { useState } from "react";
import * as Yup from "yup";
import Form from "../../../shared/Form";
import { translate } from "../../../../utils/Translate";

const CategoryForm = ({ category, onSave, setShowModal }) => {
    const categoryId = category?.id || null;
    const [errorMessage, setErrorMessage] = useState(null);

    const fields = [
        {
            name: "name",
            label: translate("admin.category.form.name"),
            type: "text",
        },
        {
            name: "description",
            label: translate("admin.category.form.description"),
            type: "textarea",
        },
        {
            name: "color",
            label: translate("admin.category.form.color"),
            type: "color",
        },
        {
            name: "isActive",
            label: translate("admin.category.form.isActive"),
            type: "select",
            options: [
                { value: "true", label: translate("admin.category.form.active") },
                { value: "false", label: translate("admin.category.form.inactive") },
            ],
        }
    ];

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required(translate("admin.category.form.validation.name")),
        description: Yup.string()
            .max(500, translate("admin.category.form.validation.descriptionMax")),
        color: Yup.string()
            .matches(/^#[0-9A-Fa-f]{6}$/, translate("admin.category.form.validation.color")),
        isActive: Yup.string()
            .required(translate("admin.category.form.validation.isActive")),
    });

    const initialValues = {
        name: category?.name || "",
        description: category?.description || "",
        color: category?.color || "#FFFFFF", 
        isActive: category?.isActive !== undefined ? String(category.isActive) : "true",
    };
    
    const handleSubmit = async (values, actions) => {
        setErrorMessage(null);
        actions.setSubmitting(true);

        try {
            const response = await onSave(values, category?.id);
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
                submitText={categoryId ? translate("admin.category.form.saveChanges") : translate("admin.category.form.createCategory")}
            />
        </div>
    );
};

export default CategoryForm;
