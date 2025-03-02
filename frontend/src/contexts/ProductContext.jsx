import React, { createContext, useContext, useState, useEffect } from "react";
import { useFetch } from "../hooks/UseFetch";
import {
    getAllProducts,
    loadProductById,
    loadProductsByCategory,
    addProduct,
    updateProductById,
    deleteProductById,
} from "../api/products/ProductLogic";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const { fetchData } = useFetch();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async (filters = {}, page = 1, limit = 10) => {
        setIsLoading(true);
        try {
            const response = await getAllProducts(fetchData, { ...filters, page, limit });
            setProducts(response.products || []);
            setTotalProducts(response.total || 0);
            return response;
        } catch (error) {
            console.error("❌ Error al obtener productos:", error);
            return { products: [], total: 0 };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                isLoading,
                totalProducts,
                loadProducts,
                loadProductById: (id) => loadProductById(fetchData, id),
                loadProductsByCategory: (category) => loadProductsByCategory(fetchData, category),
                addProduct: (newProduct, image, token) =>
                    addProduct(fetchData, setProducts, setIsLoading, newProduct, image, token),
                updateProductById: (id, updates, image, token) =>
                    updateProductById(fetchData, setProducts, setIsLoading, id, updates, image, token),
                deleteProductById: (id, token) =>
                    deleteProductById(fetchData, setProducts, setIsLoading, id, token),
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);
