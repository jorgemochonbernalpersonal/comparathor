export const fetchAllProducts = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
};

export const fetchProductById = async (fetchData, productId) => {
    return await fetchData(`products/${productId}`, "GET");
};

export const createProduct = async (fetchData, productData) => {
    return await fetchData("products", "POST", productData);
};

export const updateProduct = async (fetchData, productId, productData) => {
    return await fetchData(`products/${productId}`, "PUT", productData);
};

export const deleteProduct = async (fetchData, productId) => {
    return await fetchData(`products/${productId}`, "DELETE");
};

export const uploadMassiveImages = async (fetchData, entityName, zipFile) => {
    const formData = new FormData();
    formData.append("file", zipFile);

    try {
        const response = await fetchData(`products/upload-massive-images`, "POST", formData);
        if (!response) {
            throw new Error("No se recibió una respuesta del servidor.");
        }
        return response;
    } catch (error) {
        return { success: false, message: error.message };
    }
};
