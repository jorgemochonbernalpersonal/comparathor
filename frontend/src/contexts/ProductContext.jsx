import React, { createContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../hooks/UseFetch";
import { createProductById, updateProductById, deleteProductById } from "../api/products/ProductLogic";
import { toast } from "react-toastify";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const queryClient = useQueryClient();

    const getErrorMessage = (error, defaultMessage) => {
        let errorMsg = error?.response?.data?.message || error?.message || defaultMessage;
        return errorMsg.replace(/^Error \d+: /, "");
    };

    const createProductMutation = useMutation({
        mutationFn: (productData) => createProductById(fetchData, productData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["products"]);
            toast.success(data.message || "✅ Producto creado con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al crear producto."));
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, productData }) => updateProductById(fetchData, id, productData),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["products"]);
            toast.success(data.message || "✅ Producto actualizado con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al actualizar producto."));
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => deleteProductById(fetchData, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["products"]);
            toast.success(data.message || "✅ Producto eliminado con éxito.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "❌ Error al eliminar producto."));
        },
    });

    return (
        <ProductContext.Provider value={{
            createProduct: createProductMutation.mutateAsync,
            updateProduct: updateProductMutation.mutateAsync,
            deleteProduct: deleteProductMutation.mutateAsync,
        }}>
            {children}
        </ProductContext.Provider>
    );
};
