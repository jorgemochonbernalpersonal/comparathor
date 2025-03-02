import {
    fetchAllProducts,
    getProductById,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
} from './ProductRequest';

export const getAllProducts = async (fetchData, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        queryParams.append("page", filters.page !== undefined ? filters.page : 0);
        queryParams.append("size", filters.limit !== undefined ? filters.limit : 10);

        if (filters.name && filters.name.trim() !== "") {
            queryParams.append("name", filters.name.trim());
        }
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
        if (filters.stock) queryParams.append("stock", filters.stock);
        if (filters.brand) queryParams.append("brand", filters.brand);
        if (filters.model) queryParams.append("model", filters.model);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        const endpoint = `/api/products/filter?${queryParams.toString()}`;
        const response = await fetchAllProducts(fetchData, endpoint);
        
        return {
            total: response.totalProducts ?? 0,
            products: response.content ?? [],
        };
    } catch (error) {
        console.error("❌ Error al cargar productos:", error);
        return { total: 0, products: [] };
    }
};

export const loadProductById = async (fetchData, id) => {
    try {
        return await getProductById(fetchData, id);
    } catch (error) {
        console.error(`❌ Error al obtener el producto con ID ${id}:`, error);
        return null;
    }
};

export const loadProductsByCategory = async (fetchData, setProducts, setIsLoading, category) => {
    try {
        setIsLoading(true);
        const response = await getProductsByCategory(fetchData, category);
        setProducts(response || []);
    } catch (error) {
        console.error(`❌ Error al obtener productos de la categoría ${category}:`, error);
    } finally {
        setIsLoading(false);
    }
};

export const addProduct = async (fetchData, setProducts, setIsLoading, newProduct, image = null, token, setError = () => {}) => {
    try {
        setIsLoading(true);
        setError(null);

        let imageUrl = null;
        if (image) {
            imageUrl = await uploadProductImage(fetchData, image, token);
        }

        const createdProduct = await createProduct(fetchData, { ...newProduct, imageUrl }, token);
        setProducts((prevProducts) => [...prevProducts, createdProduct]);
    } catch (err) {
        setError(err.message || "Error al agregar producto");
    } finally {
        setIsLoading(false);
    }
};

export const updateProductById = async (fetchData, setProducts, setIsLoading, id, updates, image = null, token, setError = () => {}) => {
    try {
        setIsLoading(true);
        setError(null);

        let imageUrl = null;
        if (image) {
            imageUrl = await uploadProductImage(fetchData, image, token);
        }

        const updatedProduct = await updateProduct(fetchData, { id, ...updates, imageUrl }, token);
        setProducts((prevProducts) =>
            prevProducts.map((p) => (p.id === id ? updatedProduct : p))
        );
    } catch (err) {
        setError(err.message || "Error al actualizar producto");
    } finally {
        setIsLoading(false);
    }
};

export const deleteProductById = async (fetchData, setProducts, setIsLoading, id, token, setError = () => {}) => {
    try {
        setIsLoading(true);
        setError(null);
        await deleteProduct(fetchData, id, token);
        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
    } catch (err) {
        setError(err.message || "Error al eliminar producto");
    } finally {
        setIsLoading(false);
    }
};
