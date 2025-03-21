import React, { useState } from "react";
import * as Yup from "yup";
import Form from "../../../shared/Form";
import { translate } from "../../../../utils/Translate";
import { useBrand } from "../../../../hooks/UseBrand";
import { useCategory } from "../../../../hooks/UseCategory";

const ProductForm = ({ product, onSave, setShowModal }) => {
    const productId = product?.id || null;
    const [errorMessage, setErrorMessage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const { categories, loading: categoriesLoading } = useCategory();
    const { brands, loading: brandsLoading } = useBrand();

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(translate("admin.product.form.validation.name")),
        categoryId: Yup.number().required(translate("admin.product.form.validation.category")),
        price: Yup.number()
            .min(0, translate("admin.product.form.validation.priceMin"))
            .required(translate("admin.product.form.validation.price")),
        stock: Yup.number()
            .min(0, translate("admin.product.form.validation.stockMin"))
            .required(translate("admin.product.form.validation.stock")),
        description: Yup.string().required(translate("admin.product.form.validation.description")),
        brandId: Yup.number().required(translate("admin.product.form.validation.brand")),
        model: Yup.string().required(translate("admin.product.form.validation.model")),
        image: Yup.mixed()
            .nullable()
            .when([], (value, schema) =>
                productId ? schema : schema.required(translate("admin.product.form.validation.imageRequired"))
            )
            .test("fileType", "Formato de imagen no válido", (value) => {
                if (!value || typeof value === "string") return true;
                return value instanceof File && ["image/png", "image/jpeg", "image/jpg"].includes(value.type);
            }),
    });

    const initialValues = {
        name: product?.name || "",
        categoryId: product?.categoryId || "",
        price: product?.price || "",
        stock: product?.stock || "",
        description: product?.description || "",
        brandId: product?.brandId || "",
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
                categoryId: values.categoryId,
                price: values.price,
                stock: values.stock,
                description: values.description,
                brandId: values.brandId,
                model: values.model,
            };
            formData.append("data", JSON.stringify(productData));
            if (values.image instanceof File) {
                formData.append("image", values.image);
            } else if (typeof values.image === "string") {
                formData.append("imageUrl", values.image);
            }
            const response = await onSave(formData, product?.id);
            if (!response) throw new Error("No se recibió respuesta del servidor.");

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

    if (categoriesLoading || brandsLoading) {
        return <div className="alert alert-info text-center">🔄 Cargando categorías y marcas...</div>;
    }

    if (!categories || !brands) {
        return <div className="alert alert-danger text-center">❌ Error al cargar categorías o marcas.</div>;
    }

    // Campos del formulario
    const fields = [
        { name: "name", label: translate("admin.product.form.name"), type: "text" },
        {
            name: "categoryId",
            label: translate("admin.product.form.category"),
            type: "select",
            options: categories.map((cat) => ({ value: cat.id, label: cat.name })),
        },
        { name: "price", label: translate("admin.product.form.price"), type: "number", step: "0.01" },
        { name: "stock", label: translate("admin.product.form.stock"), type: "number" },
        { name: "description", label: translate("admin.product.form.description"), type: "textarea" },
        {
            name: "brandId",
            label: translate("admin.product.form.brand"),
            type: "select",
            options: brands.map((brand) => ({ value: brand.id, label: brand.name })),
        },
        { name: "model", label: translate("admin.product.form.model"), type: "text" },
        {
            name: "image",
            label: translate("admin.product.form.image"),
            type: "file",
            accept: "image/*",
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
