export const fetchAllProducts = async (fetchData, endpoint) => {
    return await fetchData(endpoint, "GET");
}

export const getProductById = async (fetchData, id) => {
    return await fetchData(`/api/products/${id}`, "GET");
};

export const getProductsByCategory = async (fetchData, category) => {
    return await fetchData(`/api/products/category/${category}`, "GET");
};

export const createProduct = async (fetchData, newProduct, token) => {
    return await fetchData("/api/products", "POST", newProduct, {
        Authorization: `Bearer ${token}`,
    });
};

export const updateProduct = async (fetchData, updatedProduct, token) => {
    return await fetchData(`/api/products/${updatedProduct.id}`, "PUT", updatedProduct, {
        Authorization: `Bearer ${token}`,
    });
};

export const deleteProduct = async (fetchData, id, token) => {
    return await fetchData(`/api/products/${id}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
    });
};

export const uploadProductImage = async (fetchData, image, token) => {
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetchData("/api/products/upload-image", "POST", formData, {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
    });

    return response?.image_url || null;
};
