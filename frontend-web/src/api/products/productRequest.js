
export const fetchProducts = async (fetchData) => {
    return await fetchData('/api/products');
};

export const fetchProductTypes = async (fetchData) => {
    return await fetchData('/api/product-types');
};

export const createProduct = async (fetchData, newProduct) => {
    return await fetchData('/api/products', 'POST', newProduct);
};

export const updateProduct = async (fetchData, updatedProduct) => {
    return await fetchData(`/api/products/${updatedProduct.id}`, 'PUT', updatedProduct);
};

export const deleteProduct = async (fetchData, id) => {
    return await fetchData(`/api/products/${id}`, 'DELETE');
};
