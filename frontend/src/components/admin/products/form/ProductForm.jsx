import React, { useState } from "react";
import * as Yup from "yup";
import Form from "../../../shared/Form";
import { translate } from "../../../../utils/Translate";

const ProductForm = ({ product, onSave, setShowModal }) => {
    const productId = product?.id || null;
    const [errorMessage, setErrorMessage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(translate("admin.product.form.validation.name")),
        category: Yup.string().required(translate("admin.product.form.validation.category")),
        price: Yup.number().min(0, translate("admin.product.form.validation.priceMin")).required(translate("admin.product.form.validation.price")),
        stock: Yup.number().min(0, translate("admin.product.form.validation.stockMin")).required(translate("admin.product.form.validation.stock")),
        description: Yup.string().required(translate("admin.product.form.validation.description")),
        brand: Yup.string().required(translate("admin.product.form.validation.brand")),
        model: Yup.string().required(translate("admin.product.form.validation.model")),
        image: Yup.mixed()
            .nullable()
            .when([], (value, schema) => {
                return productId
                    ? schema 
                    : schema.required(translate("admin.product.form.validation.imageRequired"));
            })
            .test("fileType", "⚠️ Formato de imagen no válido", (value) => {
                if (!value || typeof value === "string") return true; 
                return value instanceof File && ["image/png", "image/jpeg", "image/jpg"].includes(value.type);
            }),
    });
    

    const initialValues = {
        name: product?.name || "",
        category: product?.category || "",
        price: product?.price || "",
        stock: product?.stock || "",
        description: product?.description || "",
        brand: product?.brand || "",
        model: product?.model || "",
        image: product?.imageUrl || null, 
    };

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];

        if (file instanceof File) {
            setFieldValue("image", file);
        } else {
            setFieldValue("image", product?.imageUrl || null); 
        }
    };

    const handleSubmit = async (values, actions) => {
        setErrorMessage(null);
        actions.setSubmitting(true);
        setUploading(true);
    
        try {
            const formData = new FormData();
    
            const productData = {
                name: values.name,
                category: values.category,
                price: values.price,
                stock: values.stock,
                description: values.description,
                brand: values.brand,
                model: values.model,
            };
    
            formData.append("data", JSON.stringify(productData)); 

            if (values.image instanceof File) {
                formData.append("image", values.image);
            } else if (typeof values.image === "string") {
                formData.append("imageUrl", values.image);
            }

            const response = await onSave(formData, product?.id);
            if (!response) throw new Error("❌ No se recibió respuesta del servidor.");
    
            setTimeout(() => {
                if (typeof setShowModal === "function") {
                    setShowModal(false);
                }
                actions.resetForm();
            }, 500);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            actions.setSubmitting(false);
            setUploading(false);
        }
    };

    const fields = [
        { name: "name", label: translate("admin.product.form.name"), type: "text" },
        { name: "category", label: translate("admin.product.form.category"), type: "text" },
        { name: "price", label: translate("admin.product.form.price"), type: "number", step: "0.01" },
        { name: "stock", label: translate("admin.product.form.stock"), type: "number" },
        { name: "description", label: translate("admin.product.form.description"), type: "textarea" },
        { name: "brand", label: translate("admin.product.form.brand"), type: "text" },
        { name: "model", label: translate("admin.product.form.model"), type: "text" },
        {
            name: "image",
            label: translate("admin.product.form.image"),
            type: "file",
            accept: "image/*"
        },
    ];

    return (
        <div>
            {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
            {uploading && <div className="alert alert-info text-center">📤 {translate("admin.product.form.uploadingImage")}</div>}

            <Form
                fields={fields}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                handleImageChange={handleImageChange} 
                submitText={productId ? translate("admin.product.form.saveChanges") : translate("admin.product.form.createProduct")}
            />
        </div>
    );
};

export default ProductForm;
