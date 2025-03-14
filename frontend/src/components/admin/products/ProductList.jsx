import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useProduct } from "../../../hooks/UseProduct";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import ProductFilters from "./filter/ProductFilters";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import ProductForm from "./form/ProductForm";
import LoadingSpinner from "../../shared/LoadingSpinner";

const ProductList = () => {
    const productsPerPage = 10;
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const filters = useMemo(() => ({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "",
        brand: searchParams.get("brand") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        page: parseInt(searchParams.get("page") || "1", 10),
        size: parseInt(searchParams.get("size") || productsPerPage.toString(), 10),
        sortField: searchParams.get("sortField") || "id",
        sortOrder: searchParams.get("sortOrder") || "asc",
    }), [searchParams]);

    const {
        products,
        totalProducts,
        isLoading,
        createProduct,
        updateProduct,
        deleteProduct,
        refetchProducts,
        handleSort,
        sortField,
        sortOrder,
        handlePageChange,
        currentPage
    } = useProduct(filters);

    useEffect(() => {
        refetchProducts(filters);
    }, [filters, refetchProducts]);

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
            let response = productId
                ? await updateProduct({ id: productId, productData: formData })
                : await createProduct(formData);

            closeModal();
            refetchProducts();
            return response;
        } catch (error) {
            console.error("❌ Error al guardar producto:", error);
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(translate("admin.product.list.confirmDelete", { name: product.name }))) return;
        try {
            await deleteProduct(product.id);
            setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), page: "1" }));
        } catch (error) {
            console.error("❌ Error al eliminar producto:", error);
        }
    };

    const handleSortWrapper = (field) => {
        const newOrder = filters.sortField === field && filters.sortOrder === "asc" ? "desc" : "asc";
        setSearchParams(prevParams => ({
            ...Object.fromEntries(prevParams.entries()),
            sortField: field,
            sortOrder: newOrder,
            page: "1",
        }));

        handleSort(field);
    };

    const handleApplyFilters = (newFilters) => {
        setSearchParams({
            search: newFilters.search || "",
            category: newFilters.category || "",
            brand: newFilters.brand || "",
            minPrice: newFilters.minPrice || "",
            maxPrice: newFilters.maxPrice || "",
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
            page: "1",
            size: productsPerPage.toString(),
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    const handleClearFilters = () => {
        setSearchParams({ page: "1", size: productsPerPage.toString(), sortField: "id", sortOrder: "asc" });
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setSearchParams({ ...filters, search: term })}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={() => openModal()}
            />

            <div className="mb-3">
                {filters.search && <span className="badge bg-info me-2">🔍 {filters.search}</span>}
                {filters.category && <span className="badge bg-warning me-2">🏷 {filters.category}</span>}
                {filters.brand && <span className="badge bg-primary me-2">🏭 {filters.brand}</span>}
                {filters.minPrice && <span className="badge bg-success me-2">💰 Min: {filters.minPrice}</span>}
                {filters.maxPrice && <span className="badge bg-danger me-2">💰 Max: {filters.maxPrice}</span>}
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <LoadingSpinner size="medium" color="#007BFF" />
                </div>
            ) : products.length > 0 ? (
                <Table
                    title={translate("admin.product.list.productList")}
                    columns={[
                        { label: translate("admin.product.list.id"), field: "id" },
                        { label: translate("admin.product.list.name"), field: "name" },
                        { label: translate("admin.product.list.category"), field: "category" },
                        { label: translate("admin.product.list.brand"), field: "brand" },
                        { label: translate("admin.product.list.price"), field: "price" },
                        { label: translate("admin.product.list.stock"), field: "stock" },
                        {
                            label: translate("admin.product.list.createdAt"),
                            field: "createdAt",
                            render: (row) => <CellDate value={row.createdAt} />,
                        },
                    ]}
                    data={products}
                    actions={[
                        { label: `✏️ ${translate("admin.product.list.edit")}`, type: "primary", handler: openModal },
                        { label: `🗑️ ${translate("admin.product.list.delete")}`, type: "danger", handler: handleDelete },
                    ]}
                    hiddenColumnsBreakpoints={{
                        xs: [translate("admin.product.list.brand"), translate("admin.product.list.price"), translate("admin.product.list.stock")],
                        sm: [translate("admin.product.list.price"), translate("admin.product.list.stock")],
                        md: [translate("admin.product.list.stock")],
                        lg: []
                    }}
                    onSort={handleSortWrapper}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={Math.ceil(totalProducts / filters.size)}
                />
            ) : (
                <p className="text-center mt-4">{translate("admin.product.list.noProductsFound")}</p>
            )}

            {showFiltersModal && (
                <ProductFilters
                    show={showFiltersModal}
                    onClose={() => setShowFiltersModal(false)}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleClearFilters}
                />
            )}
            <Modal
                title={selectedProduct ? translate("admin.product.list.editProduct") : translate("admin.product.list.createProduct")}
                open={showModal}
                onClose={closeModal}
            >
                <ProductForm product={selectedProduct} onSave={handleSave} setShowModal={setShowModal} />
            </Modal>
        </div>
    );
};

export default ProductList;
