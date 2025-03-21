import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useComparison } from "../../../hooks/UseComparison";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import LoadingSpinner from "../../shared/LoadingSpinner";

const ComparisonList = () => {
    const comparisonsPerPage = 10;
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedComparison, setSelectedComparison] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const filters = useMemo(() => ({
        userId: searchParams.get("userId") || "",
        title: searchParams.get("title") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        name: searchParams.get("name") || "",
        category: searchParams.get("category") || "",
        price: searchParams.get("price") || "",
        stock: searchParams.get("stock") || "",
        brand: searchParams.get("brand") || "",
        model: searchParams.get("model") || "",
        comparisonIds: searchParams.getAll("comparisonIds") || [],
        page: parseInt(searchParams.get("page") || "1", 10),
        size: parseInt(searchParams.get("size") || comparisonsPerPage.toString(), 10),
        sortField: searchParams.get("sortField") || "id",
        sortOrder: searchParams.get("sortOrder") || "asc",
    }), [searchParams]);

    const {
        comparisons,
        totalComparisons,
        isLoading,
        deleteComparison,
        refetchComparisons,
        handleSort,
        sortField,
        sortOrder,
        handlePageChange,
        currentPage
    } = useComparison(filters);

    useEffect(() => {
        refetchComparisons();
    }, [filters, refetchComparisons]);

    const openModal = (comparison = null) => {
        setSelectedComparison(comparison);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedComparison(null);
        setShowModal(false);
    };

    const handleDelete = async (comparison) => {
        if (!window.confirm(translate("registered.userComparison.list.confirmDelete", { title: comparison.title }))) return;
        try {
            await deleteComparison(comparison.id);
            setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), page: "1" }));
        } catch (error) {
            console.error("❌ Error deleting comparison:", error);
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
            userId: newFilters.userId || "",
            title: newFilters.title || "",
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
            name: newFilters.name || "",
            category: newFilters.category || "",
            price: newFilters.price || "",
            stock: newFilters.stock || "",
            brand: newFilters.brand || "",
            model: newFilters.model || "",
            comparisonIds: newFilters.comparisonIds || [],
            page: "1",
            size: comparisonsPerPage.toString(),
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    const handleClearFilters = () => {
        setSearchParams({ page: "1", size: comparisonsPerPage.toString(), sortField: "id", sortOrder: "asc" });
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setSearchParams({ ...filters, title: term })}
                onOpenFilters={() => setShowFiltersModal(true)}
                entityName="comparisons"
            />

            <div className="mb-3">
                {filters.title && <span className="badge bg-info me-2">📌 {filters.title}</span>}
                {filters.userId && <span className="badge bg-primary me-2">👤 {filters.userId}</span>}
                {filters.startDate && <span className="badge bg-warning me-2">📅 {filters.startDate}</span>}
                {filters.endDate && <span className="badge bg-warning me-2">📅 {filters.endDate}</span>}
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <LoadingSpinner />
                </div>
            ) : comparisons.length > 0 ? (
                <Table
                    title={translate("registered.userComparison.list.comparisonListTitle")}
                    columns={[
                        { label: translate("registered.userComparison.list.id"), field: "id" },
                        { label: translate("registered.userComparison.list.title"), field: "title" },
                        { label: translate("registered.userComparison.list.user"), field: "userId" },
                        { label: translate("registered.userComparison.list.createdAt"), field: "createdAt", render: (row) => <CellDate value={row.createdAt} /> },
                    ]}
                    data={comparisons}
                    actions={[
                        { label: `🗑️ ${translate("registered.userComparison.list.delete")}`, type: "danger", handler: handleDelete },
                    ]}
                    hiddenColumnsBreakpoints={{
                        xs: [translate("registered.userComparison.list.user"), translate("registered.userComparison.list.createdAt")],
                        sm: [translate("registered.userComparison.list.createdAt")],
                        md: [],
                        lg: []
                    }}
                    onSort={handleSortWrapper}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={Math.ceil(totalComparisons / filters.size)}
                />
            ) : (
                <p className="text-center mt-4">{translate("registered.userComparison.list.noComparisonsFound")}</p>
            )}

            <Modal
                title={selectedComparison ? translate("registered.userComparison.list.editComparison") : translate("registered.userComparison.list.createComparison")}
                open={showModal}
                onClose={closeModal}
            >
                <p>Comparison form under development...</p>
            </Modal>
        </div>
    );
};

export default ComparisonList;
