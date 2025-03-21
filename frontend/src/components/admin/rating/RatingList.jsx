import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useRating } from "../../../hooks/UseRating";
import { useUser } from "../../../hooks/UseUser";
import { useProduct } from "../../../hooks/UseProduct";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import StarRating from "../../shared/StarRating";
import RatingFilters from "./filter/RatingFilters";
import FilterBar from "../../shared/FilterBar";
import LoadingSpinner from "../../shared/LoadingSpinner";

const RatingList = () => {
    const ratingsPerPage = 10;
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedRating, setSelectedRating] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const filters = useMemo(() => ({
        userId: searchParams.get("userId") || "",
        productId: searchParams.get("productId") || "",
        minRating: searchParams.get("minRating") || "",
        maxRating: searchParams.get("maxRating") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        page: parseInt(searchParams.get("page") || "1", 10),
        size: parseInt(searchParams.get("size") || ratingsPerPage.toString(), 10),
        sortField: searchParams.get("sortField") || "createdAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
    }), [searchParams]);

    const { ratings, totalRatings, isLoading, createRating, updateRating, deleteRating, refetchRatings, handleSort, sortField, sortOrder, handlePageChange, currentPage } = useRating(filters);
    const { users } = useUser();
    const { products } = useProduct();
    useEffect(() => {
        refetchRatings();
    }, [filters, refetchRatings]);

    const openModal = (rating = null) => {
        setSelectedRating(rating);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedRating(null);
        setShowModal(false);
    };

    const handleDelete = async (rating) => {
        if (!window.confirm(translate("admin.rating.list.confirmDelete", { user: rating.userName, product: rating.productName }))) return;
        try {
            await deleteRating(rating.id);
            setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), page: "1" }));
        } catch (error) {
            console.error("❌ Error al eliminar calificación:", error);
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
            productId: newFilters.productId || "",
            minRating: newFilters.minRating || "",
            maxRating: newFilters.maxRating || "",
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
            page: "1",
            size: ratingsPerPage.toString(),
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    const handleClearFilters = () => {
        setSearchParams({ page: "1", size: ratingsPerPage.toString(), sortField: "createdAt", sortOrder: "desc" });
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setSearchParams({ ...filters, search: term })}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={() => openModal()}
                entityName="ratings"
            />

            <div className="mb-3">
                {filters.userId && <span className="badge bg-primary me-2">👤 {users.find(u => u.id.toString() === filters.userId)?.name || "Unknown User"}</span>}
                {filters.productId && <span className="badge bg-info me-2">📦 {products.find(p => p.id.toString() === filters.productId)?.name || "Unknown Product"}</span>}
                {filters.minRating && <span className="badge bg-success me-2">⭐ Min: {filters.minRating}</span>}
                {filters.maxRating && <span className="badge bg-danger me-2">⭐ Max: {filters.maxRating}</span>}
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <LoadingSpinner />
                </div>
            ) : ratings.length > 0 ? (
                <Table
                    title={translate("admin.rating.list.ratingList")}
                    columns={[
                        { label: translate("admin.rating.list.user"), field: "userName" },
                        { label: translate("admin.rating.list.product"), field: "productName" },
                        {
                            label: translate("admin.rating.list.rating"),
                            field: "rating",
                            render: (row) => <StarRating value={row.rating} />,
                        },
                        { label: translate("admin.rating.list.comment"), field: "comment" },
                        {
                            label: translate("admin.rating.list.createdAt"),
                            field: "createdAt",
                            render: (row) => <CellDate value={row.createdAt} />,
                        },
                    ]}
                    data={ratings.map(rating => ({
                        ...rating,
                        userName: users.find(u => u.id === rating.userId)?.name || "Unknown User",
                        productName: rating.product?.name || "Unknown Product",
                    }))}
                    actions={[
                        { label: `✏️ ${translate("admin.rating.list.edit")}`, type: "primary", handler: openModal },
                        { label: `🗑️ ${translate("admin.rating.list.delete")}`, type: "danger", handler: handleDelete },
                    ]}
                    onSort={handleSortWrapper}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={Math.ceil(totalRatings / filters.size)}
                />
            ) : (
                <p className="text-center mt-4">{translate("admin.rating.list.noRatingsFound")}</p>
            )}

            <RatingFilters
                open={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleClearFilters}
                users={users}
                products={products}
            />
        </div>
    );
};

export default RatingList;
