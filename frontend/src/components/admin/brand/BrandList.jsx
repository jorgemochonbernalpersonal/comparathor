import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useBrand } from "../../../hooks/UseBrand";
import { useExcel } from "../../../hooks/UseExcel";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import BrandFilters from "./filter/BrandFilter";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import BrandForm from "./form/BrandForm";
import LoadingSpinner from "../../shared/LoadingSpinner";

const BrandList = () => {
    const brandsPerPage = 10;
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const filters = useMemo(() => ({
        reliability: searchParams.get("reliability") || "",
        isActive: searchParams.get("isActive") !== null ? searchParams.get("isActive") === "true" : "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        page: parseInt(searchParams.get("page") || "1", 10),
        size: parseInt(searchParams.get("size") || brandsPerPage.toString(), 10),
        sortField: searchParams.get("sortField") || "id",
        sortOrder: searchParams.get("sortOrder") || "asc",
    }), [searchParams]);

    const { brands, totalBrands, isLoading, createBrand, updateBrand, deleteBrand, refetchBrands, handleSort, sortField, sortOrder, handlePageChange, currentPage } = useBrand(filters);
    const { handleUploadExcel, handleDownloadTemplate, isDownloading } = useExcel();

    useEffect(() => {
        refetchBrands(filters);
    }, [filters, refetchBrands]);

    const openModal = (brand = null) => {
        setSelectedBrand(brand);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedBrand(null);
        setShowModal(false);
    };

    const handleSave = async (formData, brandId) => {
        try {
            let response = brandId
                ? await updateBrand({ id: brandId, brandData: formData })
                : await createBrand(formData);

            closeModal();
            refetchBrands();
            return response;
        } catch (error) {
            console.error("Error al guardar marca:", error);
        }
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(translate("admin.brand.list.confirmDelete", { name: brand.name }))) return;
        try {
            await deleteBrand(brand.id);
            setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), page: "1" }));
        } catch (error) {
            console.error("Error al eliminar marca:", error);
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
            reliability: newFilters.reliability || "",
            isActive: newFilters.isActive !== undefined ? newFilters.isActive : "",
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
            page: "1",
            size: brandsPerPage.toString(),
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    const handleClearFilters = () => {
        setSearchParams({ page: "1", size: brandsPerPage.toString(), sortField: "id", sortOrder: "asc" });
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setSearchParams({ ...filters, search: term })}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={() => openModal()}
                onUploadExcel={handleUploadExcel}
                onDownloadTemplate={handleDownloadTemplate}
                entityName="brands"
                isDownloading={isDownloading}
            />

            <div className="mb-3">
                {filters.reliability && <span className="badge bg-info me-2">⭐ Fiabilidad: {filters.reliability}</span>}
                {filters.isActive !== "" && <span className="badge bg-success me-2">{filters.isActive ? "✅ Activo" : "❌ Inactivo"}</span>}
                {filters.startDate && <span className="badge bg-warning me-2">📅 {filters.startDate}</span>}
                {filters.endDate && <span className="badge bg-warning me-2">📅 {filters.endDate}</span>}
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <LoadingSpinner />
                </div>
            ) : brands.length > 0 ? (
                <Table
                    title={translate("admin.brand.list.brandList")}
                    columns={[
                        { label: translate("admin.brand.list.id"), field: "id" },
                        { label: translate("admin.brand.list.name"), field: "name" },
                        { label: translate("admin.brand.list.reliability"), field: "reliability" },
                        { label: translate("admin.brand.list.isActive"), field: "isActive", render: (row) => row.isActive ? "✅" : "❌" },
                        {
                            label: translate("admin.brand.list.createdAt"),
                            field: "createdAt",
                            render: (row) => <CellDate value={row.createdAt} />,
                        },
                    ]}
                    data={brands}
                    actions={[
                        { label: `✏️ ${translate("admin.brand.list.edit")}`, type: "primary", handler: openModal },
                        { label: `🗑️ ${translate("admin.brand.list.delete")}`, type: "danger", handler: handleDelete },
                    ]}
                    hiddenColumnsBreakpoints={{
                        xs: [translate("admin.brand.list.reliability"), translate("admin.brand.list.createdAt")],
                        sm: [translate("admin.brand.list.createdAt")],
                        md: [],
                        lg: []
                    }}
                    onSort={handleSortWrapper}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={Math.ceil(totalBrands / filters.size)}
                />

            ) : (
                <p className="text-center mt-4">{translate("admin.brand.list.noBrandsFound")}</p>
            )}

            <BrandFilters
                open={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleClearFilters}
            />

            <Modal
                title={selectedBrand ? translate("admin.brand.list.editBrand") : translate("admin.brand.list.createBrand")}
                open={showModal}
                onClose={closeModal}
            >
                <BrandForm brand={selectedBrand} onSave={handleSave} setShowModal={setShowModal} />
            </Modal>
        </div>
    );
};

export default BrandList;
