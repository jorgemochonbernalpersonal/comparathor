import React, { useEffect, useState } from "react";
import { useProduct } from "../../../contexts/ProductContext";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import ProductFilters from "./filter/ProductFilters";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import ProductForm from "./form/ProductForm";

const ProductList = () => {
    const { loadProducts, updateProductById, addProduct, deleteProductById, isLoading, totalProducts } = useProduct();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = 10;
    const [filters, setFilters] = useState({
        name: "",
        category: "",
        minPrice: "",
        maxPrice: "",
        stock: "",
        brand: "",
        model: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await loadProducts(filters, currentPage, productsPerPage);
                if (response?.products) {
                    setFilteredProducts(response.products);
                }
            } catch (error) {
                console.error("❌ Error al cargar productos:", error);
            }
        };
        fetchProducts();
    }, [currentPage, productsPerPage, filters]);

    const openModal = (product = null) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setShowModal(false);
    };

    const handleSave = async (formData, productId) => {
        try {
            if (productId) {
                await updateProductById(productId, formData);
            } else {
                await addProduct(formData);
            }
            closeModal();
            setCurrentPage(0);
        } catch (error) {
            console.error("❌ Hubo un error al guardar el producto.");
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el producto ${product.name}?`)) return;
        try {
            await deleteProductById(product.id);
            setCurrentPage(0);
        } catch (error) {
            console.error("❌ No se pudo eliminar el producto.");
        }
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setFilters((prev) => ({ ...prev, name: term }))}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={openModal}
            />

            {!isLoading && filteredProducts.length > 0 ? (
                <Table
                    columns={[
                        { label: "ID", field: "id" },
                        { label: "Nombre", field: "name" },
                        { label: "Categoría", field: "category" },
                        { label: "Precio", field: "price", format: (value) => `$${value.toFixed(2)}` },
                        { label: "Stock", field: "stock" },
                        { label: "Marca", field: "brand" },
                        { label: "Modelo", field: "model" },
                        { label: "Imagen", field: (row) =>
                            row.imageUrl ? (
                                <img src={row.imageUrl} alt={row.name} className="product-img" />
                            ) : (
                                "Sin imagen"
                            )
                        },
                        { label: "Creado", field: (row) => <CellDate value={row.createdAt} /> },
                    ]}
                    data={filteredProducts}
                    actions={[
                        { label: "✏️ Editar", type: "warning", handler: openModal },
                        { label: "🗑️ Eliminar", type: "danger", handler: handleDelete },
                    ]}
                    currentPage={currentPage}
                    itemsPerPage={productsPerPage}
                    totalItems={totalProducts}
                    onPageChange={setCurrentPage}
                />
            ) : (
                <p className="text-center mt-4">No se encontraron productos.</p>
            )}

            {showFiltersModal && (
                <ProductFilters
                    show={showFiltersModal}
                    onClose={() => setShowFiltersModal(false)}
                    onApplyFilters={setFilters}
                />
            )}

            {showModal && (
                <Modal title={selectedProduct ? "Editar Producto" : "Crear Producto"} onClose={closeModal}>
                    <ProductForm product={selectedProduct} onSave={handleSave} />
                </Modal>
            )}
        </div>
    );
};

export default ProductList;
