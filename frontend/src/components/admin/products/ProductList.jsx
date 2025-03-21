import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useProduct } from "../../../hooks/UseProduct";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import ImageCell from "../../shared/ImageCell";
import ProductFilters from "./filter/ProductFilters";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import ProductForm from "./form/ProductForm";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { useExcel } from "../../../hooks/UseExcel";
import { useBrand } from "../../../hooks/UseBrand";
import { useCategory } from "../../../hooks/UseCategory";

const ProductList = () => {
    const productsPerPage = 10;
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const { handleUploadExcel, handleDownloadTemplate, isDownloading } = useExcel();
    const { categories } = useCategory();
    const { brands } = useBrand();

    const filters = useMemo(() => ({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "",
        brand: searchParams.get("brand") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        minStock: searchParams.get("minStock") || "",
        maxStock: searchParams.get("maxStock") || "",
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
        uploadImagesZip,
        refetchProducts,
        handleSort,
        sortField,
        sortOrder,
        handlePageChange,
        currentPage
    } = useProduct(filters);

    useEffect(() => {
        refetchProducts();
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
        let response = productId
            ? await updateProduct({ id: productId, productData: formData })
            : await createProduct(formData);
        closeModal();
        refetchProducts();
        return response;
    };

    const handleDelete = async (product) => {
        await deleteProduct(product.id);
        await refetchProducts();
        setSearchParams(prev => {
            const currentPage = parseInt(prev.get("page") || "1", 10);
            const updatedTotalProducts = Math.max(0, totalProducts - 1);
            const totalPages = Math.max(1, Math.ceil(updatedTotalProducts / filters.size));
            const newPage = currentPage > totalPages ? totalPages : currentPage;
            return { ...Object.fromEntries(prev.entries()), page: newPage.toString() };
        });
        window.location.reload()
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

    const handleUploadImagesZip = async (zipFile) => {
        await uploadImagesZip({ entityName: "products", zipFile });
        refetchProducts();
    };

    const handleApplyFilters = (newFilters) => {
        const params = {
            ...(newFilters.minPrice && newFilters.minPrice !== "" && { minPrice: newFilters.minPrice }),
            ...(newFilters.maxPrice && newFilters.maxPrice !== "" && { maxPrice: newFilters.maxPrice }),
            ...(newFilters.minStock && newFilters.minStock !== "" && { minStock: newFilters.minStock }),
            ...(newFilters.maxStock && newFilters.maxStock !== "" && { maxStock: newFilters.maxStock }),
            ...(newFilters.startDate && newFilters.startDate !== "" && { startDate: newFilters.startDate }),
            ...(newFilters.endDate && newFilters.endDate !== "" && { endDate: newFilters.endDate }),
            ...(newFilters.search?.trim() && { search: newFilters.search.trim() }),
        };

        setSearchParams(params);
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
                onUploadExcel={handleUploadExcel}
                onUploadImagesZip={handleUploadImagesZip}
                onDownloadTemplate={handleDownloadTemplate}
                entityName="products"
                isDownloading={isDownloading}
                isUploading={isUploadingImages}
                showImageUpload={true}
            />
            <div className="mb-3">
                {filters.search && <span className="badge bg-info me-2">🔍 {translate("filter.search")}: {filters.search}</span>}
                {filters.category && <span className="badge bg-warning me-2">🏷 {translate("filter.category")}: {filters.category}</span>}
                {filters.brand && <span className="badge bg-primary me-2">🏭 {translate("filter.brand")}: {filters.brand}</span>}
                {filters.minPrice && <span className="badge bg-success me-2">{translate("filter.minPriceLabel")}: {filters.minPrice}</span>}
                {filters.maxPrice && <span className="badge bg-danger me-2">{translate("filter.maxPriceLabel")}: {filters.maxPrice}</span>}
                {filters.minStock && <span className="badge bg-secondary me-2">{translate("filter.minStockLabel")}: {filters.minStock}</span>}
                {filters.maxStock && <span className="badge bg-dark me-2">{translate("filter.maxStockLabel")}: {filters.maxStock}</span>}
                {filters.createdAt && <span className="badge bg-info me-2">{translate("filter.createdAt")}: {filters.createdAt}</span>}
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
                        { label: translate("admin.product.list.description"), field: "description" },
                        {
                            label: translate("admin.product.list.category"),
                            field: "categoryId",
                            render: (row) => categories.find(c => c.id === row.categoryId)?.name || "Sin categoría"
                        },
                        {
                            label: translate("admin.product.list.brand"),
                            field: "brandId",
                            render: (row) => brands.find(b => b.id === row.brandId)?.name || "Sin marca"
                        },
                        { label: translate("admin.product.list.price"), field: "price" },
                        { label: translate("admin.product.list.stock"), field: "stock" },
                        {
                            label: translate("admin.product.list.image"),
                            field: "imageUrl",
                            render: (row) => <ImageCell value={row.imageUrl} alt={row.name} />,
                        },
                        { label: translate("admin.product.list.createdBy"), field: "createdBy" },
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
                        xs: [translate("admin.product.list.description"), translate("admin.product.list.stock"), translate("admin.product.list.image"), translate("admin.product.list.createdBy"), translate("admin.product.list.stock"), translate("admin.product.list.price"), translate("admin.product.list.stock"), translate("admin.product.list.createdAt"), translate("admin.product.list.brand"), translate("admin.product.list.category")],
                        sm: [translate("admin.product.list.description"), translate("admin.product.list.image"), translate("admin.product.list.createdBy"), translate("admin.product.list.stock"), translate("admin.product.list.price"), translate("admin.product.list.createdAt"), translate("admin.product.list.createdAt"), translate("admin.product.list.brand"), translate("admin.product.list.category")],
                        md: [translate("admin.product.list.image"), translate("admin.product.list.createdBy"), translate("admin.product.list.description"), translate("admin.product.list.stock"), translate("admin.product.list.price"), translate("admin.product.list.category")],
                        lg: [translate("admin.product.list.description"), translate("admin.product.list.createdBy")]
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
                    open={showFiltersModal}
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
