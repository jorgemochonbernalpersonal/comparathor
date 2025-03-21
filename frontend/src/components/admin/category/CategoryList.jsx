import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useCategory } from "../../../hooks/UseCategory";
import { useExcel } from "../../../hooks/UseExcel";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import CategoryFilters from "./filter/CategoryFilter";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import CategoryForm from "./form/CategoryForm";
import LoadingSpinner from "../../shared/LoadingSpinner";

const CategoryList = () => {
    const categoriesPerPage = 10;
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const filters = useMemo(() => ({
        color: searchParams.get("color") || "",
        isActive: searchParams.get("isActive") !== null ? searchParams.get("isActive") === "true" : "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        page: parseInt(searchParams.get("page") || "1", 10),
        size: parseInt(searchParams.get("size") || categoriesPerPage.toString(), 10),
        sortField: searchParams.get("sortField") || "id",
        sortOrder: searchParams.get("sortOrder") || "asc",
    }), [searchParams]);

    const { categories, totalCategories, isLoading, createCategory, updateCategory, deleteCategory, refetchCategories, handleSort, sortField, sortOrder, handlePageChange, currentPage } = useCategory(filters);
    const { handleUploadExcel, handleDownloadTemplate, isDownloading } = useExcel();

    useEffect(() => {
        refetchCategories(filters);
    }, [filters, refetchCategories]);

    const openModal = (category = null) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedCategory(null);
        setShowModal(false);
    };

    const handleSave = async (formData, categoryId) => {
        try {
            let response = categoryId
                ? await updateCategory({ id: categoryId, categoryData: formData })
                : await createCategory(formData);

            closeModal();
            refetchCategories();
            return response;
        } catch (error) {
            console.error("Error al guardar categoría:", error);
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(translate("admin.category.list.confirmDelete", { name: category.name }))) return;
        try {
            await deleteCategory(category.id);
            setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), page: "1" }));
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
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
            color: newFilters.color || "",
            isActive: newFilters.isActive !== undefined ? newFilters.isActive : "",
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
            page: "1",
            size: categoriesPerPage.toString(),
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    const handleClearFilters = () => {
        setSearchParams({ page: "1", size: categoriesPerPage.toString(), sortField: "id", sortOrder: "asc" });
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setSearchParams({ ...filters, search: term })}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={() => openModal()}
                onUploadExcel={handleUploadExcel}
                onDownloadTemplate={handleDownloadTemplate}
                entityName="categories"
                isDownloading={isDownloading}
            />

            <div className="mb-3">
                {filters.color && <span className="badge bg-info me-2">🎨 {filters.color}</span>}
                {filters.isActive !== "" && <span className="badge bg-success me-2">{filters.isActive ? "✅ Activo" : "❌ Inactivo"}</span>}
                {filters.startDate && <span className="badge bg-warning me-2">📅 {filters.startDate}</span>}
                {filters.endDate && <span className="badge bg-warning me-2">📅 {filters.endDate}</span>}
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <LoadingSpinner />
                </div>
            ) : categories.length > 0 ? (
                <Table
                    title={translate("admin.category.list.categoryList")}
                    columns={[
                        { label: translate("admin.category.list.id"), field: "id" },
                        { label: translate("admin.category.list.name"), field: "name" },
                        { label: translate("admin.category.list.description"), field: "description" },
                        { label: translate("admin.category.list.color"), field: "color" },
                        { label: translate("admin.category.list.isActive"), field: "isActive", render: (row) => row.isActive ? "✅" : "❌" },
                        {
                            label: translate("admin.category.list.createdAt"),
                            field: "createdAt",
                            render: (row) => <CellDate value={row.createdAt} />,
                        },
                    ]}
                    data={categories}
                    actions={[
                        { label: `✏️ ${translate("admin.category.list.edit")}`, type: "primary", handler: openModal },
                        { label: `🗑️ ${translate("admin.category.list.delete")}`, type: "danger", handler: handleDelete },
                    ]}
                    hiddenColumnsBreakpoints={{
                        xs: [translate("admin.category.list.description"), translate("admin.category.list.createdAt")],
                        sm: [translate("admin.category.list.createdAt")],
                        md: [],
                        lg: []
                    }}
                    onSort={handleSortWrapper}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={Math.ceil(totalCategories / filters.size)}
                />

            ) : (
                <p className="text-center mt-4">{translate("admin.category.list.noCategoriesFound")}</p>
            )}

            <CategoryFilters
                open={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleClearFilters}
            />

            <Modal
                title={selectedCategory ? translate("admin.category.list.editCategory") : translate("admin.category.list.createCategory")}
                open={showModal}
                onClose={closeModal}
            >
                <CategoryForm category={selectedCategory} onSave={handleSave} setShowModal={setShowModal} />
            </Modal>
        </div>
    );
};

export default CategoryList;
