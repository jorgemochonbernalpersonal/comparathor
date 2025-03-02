import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../../../../contexts/ProductContext";

const ProductForm = ({ onSave }) => {
    const { products } = useProduct()
    const { id } = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [previewImages, setPreviewImages] = useState([]);

    const [initialValues, setInitialValues] = useState({
        category: "",
        name: "",
        description: "",

        brand: "",
        model: "",
        price: "",
        stock: 0,
        image_url: "", 
        is_public: false,
        published_at: null,
    });

    useEffect(() => {
        if (id) {
            const existingProduct = products.find((p) => p.id === parseInt(id));
            if (existingProduct) {
                setInitialValues({
                    category: existingProduct.category || "",
                    name: existingProduct.name || "",
                    description: existingProduct.description || "",
                    brand: existingProduct.brand || "",
                    model: existingProduct.model || "",
                    price: existingProduct.price || "",
                    stock: existingProduct.stock || 0,
                    image_url: existingProduct.image_url || "",
                    is_public: existingProduct.is_public || false,
                    published_at: existingProduct.published_at || null,
                });

                if (existingProduct.image_url) {
                    setPreviewImages([existingProduct.image_url]);
                }
            }
        }
    }, [id, products]);

    const validationSchema = Yup.object({
        category: Yup.string().required("La categoría es obligatoria"),
        name: Yup.string().min(2, "Mínimo 2 caracteres").required("Nombre obligatorio"),
        description: Yup.string().max(500, "Máximo 500 caracteres").notRequired(),
        brand: Yup.string().notRequired(),
        model: Yup.string().notRequired(),
        price: Yup.number().positive("Debe ser un número positivo").required("Precio obligatorio"),
        stock: Yup.number().integer("Debe ser un número entero").min(0, "Debe ser mayor o igual a 0"),
        image_url: Yup.mixed().notRequired(),
        is_public: Yup.boolean(),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        setSubmitting(true);
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append("category", values.category);
            formData.append("name", values.name.trim());
            formData.append("description", values.description?.trim() || "");
            formData.append("brand", values.brand?.trim() || "");
            formData.append("model", values.model?.trim() || "");
            formData.append("price", parseFloat(values.price));
            formData.append("stock", parseInt(values.stock));
            formData.append("is_public", values.is_public);

            // Si se publica, asignar la fecha actual
            if (values.is_public) {
                formData.append("published_at", new Date().toISOString());
            } else {
                formData.append("published_at", null);
            }

            if (values.image_url instanceof File) {
                formData.append("image", values.image_url);
            }

            console.log("Datos enviados:", Object.fromEntries(formData.entries())); // 🔍 Debugging

            await onSave(formData, id);
            navigate("/admin/products");
        } catch (error) {
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
                {({ isSubmitting, setFieldValue }) => (
                    <Form>
                        <div className="mb-3">
                            <label className="form-label">Categoría</label>
                            <Field name="category" type="text" className="form-control" />
                            <ErrorMessage name="category" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Nombre</label>
                            <Field name="name" type="text" className="form-control" />
                            <ErrorMessage name="name" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Descripción</label>
                            <Field as="textarea" name="description" className="form-control" />
                            <ErrorMessage name="description" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Marca</label>
                            <Field name="brand" type="text" className="form-control" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Modelo</label>
                            <Field name="model" type="text" className="form-control" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Precio</label>
                            <Field name="price" type="number" className="form-control" step="0.01" />
                            <ErrorMessage name="price" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Stock</label>
                            <Field name="stock" type="number" className="form-control" />
                            <ErrorMessage name="stock" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">¿Publicar?</label>
                            <Field name="is_public" type="checkbox" className="form-check-input ms-2" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Imagen</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    setFieldValue("image_url", file);

                                    if (file) {
                                        setPreviewImages([URL.createObjectURL(file)]);
                                    }
                                }}
                            />
                        </div>

                        {previewImages.length > 0 && (
                            <div className="mb-3 text-center">
                                <p className="text-muted">Vista previa de la imagen:</p>
                                <img
                                    src={previewImages[0]}
                                    alt="Vista previa"
                                    className="img-thumbnail"
                                    style={{ maxWidth: "150px", maxHeight: "150px" }}
                                />
                            </div>
                        )}

                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-success me-2" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : id ? "Guardar Cambios" : "Crear Producto"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/products")}>
                                Cancelar
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ProductForm;
 