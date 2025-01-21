import React, { createContext, useContext, useState } from 'react';
import { useFetch } from './../hooks/useFetch';
import {
    fetchProducts,
    fetchProductTypes,
    createProduct,
    updateProduct,
    deleteProduct,
} from './../api/products/productRequest';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const { fetchData } = useFetch();

    const loadProducts = async () => {
        const data = await fetchProducts(fetchData);
        setProducts(data);
    };

    const loadProductTypes = async () => {
        const data = await fetchProductTypes(fetchData);
        setProductTypes(data);
    };

    const addProduct = async (newProduct) => {
        const createdProduct = await createProduct(fetchData, newProduct);
        setProducts((prevProducts) => [...prevProducts, createdProduct]);
    };

    const updateProductById = async (updatedProduct) => {
        const product = await updateProduct(fetchData, updatedProduct);
        setProducts((prevProducts) =>
            prevProducts.map((p) => (p.id === product.id ? product : p))
        );
    };

    const deleteProductById = async (id) => {
        await deleteProduct(fetchData, id);
        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                productTypes,
                loadProducts,
                loadProductTypes,
                addProduct,
                updateProductById,
                deleteProductById,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);
