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
