import {
    fetchProductById,
    fetchAllProducts,
    deleteProduct,
    createProduct,
    updateProduct
} from "./ProductRequest";


export const getAllProducts = async (fetchData, filters = {}) => {
    try {

        const queryParams = new URLSearchParams({
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sortField: filters.sortField ?? "id",
            sortOrder: filters.sortOrder ?? "asc",
        });

        if (filters.category) queryParams.append("category", filters.category);
        if (filters.brand) queryParams.append("brand", filters.brand);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
        if (filters.stock) queryParams.append("stock", filters.stock);
        if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        const endpoint = `products?${queryParams.toString()}`;
        const response = await fetchAllProducts(fetchData, endpoint);
        console.log(response)
        return {
            total: response.total ?? 0,
            products: response.content ?? [],
        };
    } catch (error) {
        return { total: 0, products: [] };
    }
};

export const createProductById = async (fetchData, productData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("❌ fetchData no es una función válida.");
        }
        const createdProduct = await createProduct(fetchData, productData);
        if (!createdProduct || createdProduct.error) {
            throw new Error(createdProduct?.message || "❌ Error al registrar el producto.");
        }
        return createdProduct;
    } catch (error) {
        console.error("❌ Error en createProduct:", error);
        throw new Error(error.message || "❌ Error al registrar el producto.");
    }
};

export const getProductById = async (fetchData, productId) => {
    try {
        return await fetchProductById(fetchData, productId);
    } catch (error) {
        return null;
    }
};

export const updateProductById = async (fetchData, productId, productData) => {
    try {
        console.log(productData)
        const response = await updateProduct(fetchData, productId, productData);
        console.log(response)
        return response;
    } catch (error) {
        return null;
    }
};

export const deleteProductById = async (fetchData, productId) => {
    try {
        await deleteProduct(fetchData, productId);
        console.log(`🗑️ Producto con ID ${productId} eliminado.`);
    } catch (error) {
        console.error("❌ Error eliminando producto:", error);
    }
};
