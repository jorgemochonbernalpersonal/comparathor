import {
    fetchProductById,
    fetchAllProducts,
    deleteProduct,
    createProduct,
    updateProduct,
    uploadMassiveImages,
} from "./ProductRequest";

export const getAllProducts = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams({
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sortField: filters.sortField ?? "id",
            sortOrder: filters.sortOrder ?? "asc",
        });

        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

        if (filters.minStock) queryParams.append("minStock", filters.minStock);
        if (filters.maxStock) queryParams.append("maxStock", filters.maxStock);

        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
        const endpoint = `products?${queryParams.toString()}`;
        const response = await fetchAllProducts(fetchData, endpoint);

        return {
            total: response.total ?? 0,
            products: response.content ?? [],
        };
    } catch (error) {
        throw new Error(error.message || "Error obteniendo productos.");
    }
};


export const createProductById = async (fetchData, productData) => {
    try {
        if (typeof fetchData !== "function") {
            throw new Error("fetchData no es una función válida.");
        }
        const createdProduct = await createProduct(fetchData, productData);
        if (!createdProduct || createdProduct.error) {
            throw new Error(createdProduct?.message || "Error al registrar el producto.");
        }
        return createdProduct;
    } catch (error) {
        throw new Error(error.message || "Error al registrar el producto.");
    }
};

export const getProductById = async (fetchData, productId) => {
    try {
        return await fetchProductById(fetchData, productId);
    } catch (error) {
        throw new Error(error.message || "Error obteniendo el producto.");
    }
};

export const updateProductById = async (fetchData, productId, productData) => {
    console.log('coco')
    console.log(productData)
    try {
        return await updateProduct(fetchData, productId, productData);
    } catch (error) {
        throw new Error(error.message || "Error actualizando el producto.");
    }
};

export const deleteProductById = async (fetchData, productId) => {
    try {
        return await deleteProduct(fetchData, productId);
    } catch (error) {
        throw new Error(error.message || "Error eliminando el producto.");
    }
};
export const uploadProductImagesZip = async (fetchData, entityName, zipFile) => {
    try {
        const response = await uploadMassiveImages(fetchData, entityName, zipFile);
        if (!response.success) {
            throw new Error(response.message || "Error subiendo imágenes");
        }
        return response.message;
    } catch (error) {
        throw new Error(error.message || "Error subiendo imágenes");
    }
};
