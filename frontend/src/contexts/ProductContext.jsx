import React, { createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import {
    createProductById,
    updateProductById,
    deleteProductById,
    uploadProductImagesZip,
} from "../api/products/ProductLogic";
import { toast } from "react-toastify";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const cleanErrorMessage = (error, defaultMessage) => {
        let errorMsg = error?.response?.data?.message || error?.message || defaultMessage;
        return errorMsg.replace(/^Error \d+: /, "").trim();
    };

    const createProductMutation = useMutation({
        mutationFn: (productData) => createProductById(fetchData, productData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["products"]);
            toast.success(data.message || "✅ Producto creado con éxito.");
        },
        onError: (error) => {
            toast.error(cleanErrorMessage(error, "Error al crear producto."));
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, productData }) => updateProductById(fetchData, id, productData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["products"]);
            toast.success(data.message || "✅ Producto actualizado con éxito.");
        },
        onError: (error) => {
            toast.error(cleanErrorMessage(error, "Error al actualizar producto."));
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => deleteProductById(fetchData, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["products"]);
            toast.success(data.message || "✅ Producto eliminado con éxito.");
        },
        onError: (error) => {
            toast.error(cleanErrorMessage(error, "Error al eliminar producto."));
        },
    });

    const uploadImagesMutation = useMutation({
        mutationFn: ({ entityName, zipFile }) => uploadProductImagesZip(fetchData, entityName, zipFile),
        onSuccess: (message) => {
            queryClient.invalidateQueries(["products"]);
            toast.success(message || "✅ Imágenes subidas con éxito.");
        },
        onError: (error) => {
            const errorMsg = cleanErrorMessage(error, "Error al subir imágenes.");
            toast.error(errorMsg);
        },
    });

    return (
        <ProductContext.Provider value={{
            createProduct: createProductMutation.mutateAsync,
            updateProduct: updateProductMutation.mutateAsync,
            deleteProduct: deleteProductMutation.mutateAsync,
            uploadImagesZip: uploadImagesMutation.mutateAsync,
        }}>
            {children}
        </ProductContext.Provider>
    );
};
