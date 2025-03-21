import React, { useState } from "react";
import * as Yup from "yup";
import Form from "../../../shared/Form";
import { translate } from "../../../../utils/Translate";

const BrandForm = ({ brand, onSave, setShowModal }) => {
    const brandId = brand?.id || null;
    const [errorMessage, setErrorMessage] = useState(null);

    const fields = [
        {
            name: "name",
            label: translate("admin.brand.form.name"),
            type: "text",
        },
        {
            name: "logoUrl",
            label: translate("admin.brand.form.logoUrl"),
            type: "text",
        },
        {
            name: "reliability",
            label: translate("admin.brand.form.reliability"),
            type: "number",
            min: 1,
            max: 5,
        },
        {
            name: "isActive",
            label: translate("admin.brand.form.isActive"),
            type: "select",
            options: [
                { value: "true", label: translate("admin.brand.form.active") },
                { value: "false", label: translate("admin.brand.form.inactive") },
            ],
        }
    ];

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required(translate("admin.brand.form.validation.name")),
        logoUrl: Yup.string()
            .url(translate("admin.brand.form.validation.logoUrl")),
        reliability: Yup.number()
            .min(1, translate("admin.brand.form.validation.reliabilityMin"))
            .max(5, translate("admin.brand.form.validation.reliabilityMax"))
            .required(translate("admin.brand.form.validation.reliability")),
        isActive: Yup.string()
            .required(translate("admin.brand.form.validation.isActive")),
    });

    const initialValues = {
        name: brand?.name || "",
        logoUrl: brand?.logoUrl || "",
        reliability: brand?.reliability || 3,
        isActive: brand?.isActive !== undefined ? String(brand.isActive) : "true",
    };

    const handleSubmit = async (values, actions) => {
        setErrorMessage(null);
        actions.setSubmitting(true);

        try {
            const response = await onSave(values, brand?.id);
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
                submitText={brandId ? translate("admin.brand.form.saveChanges") : translate("admin.brand.form.createBrand")}
            />
        </div>
    );
};

export default BrandForm;
