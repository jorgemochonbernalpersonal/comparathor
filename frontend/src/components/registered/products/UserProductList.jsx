import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Typography, Button, Alert } from "@mui/material";
import { useProduct } from "../../../hooks/UseProduct";
import { useRating } from "../../../hooks/UseRating";
import { useAuth } from "../../../hooks/UseAuth";
import Modal from "../../../components/shared/Modal";
import ProductCardGrid from "./grid/ProductCardGrid";
import RatingForm from "./form/RatingForm";
import CompareProductsModal from "../comparisons/modal/CompareProductsModal";
import { translate } from "../../../utils/Translate";
import { DEFAULT_LIMIT_PER_PAGE } from "../../../utils/Constants";
import "../../../styles/registered/UserProductList.css";

const UserProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
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
        size: parseInt(searchParams.get("size") || DEFAULT_LIMIT_PER_PAGE.toString(), 10),
        sortField: searchParams.get("sortField") || "id",
        sortOrder: searchParams.get("sortOrder") || "asc",
    }), [searchParams]);

    const { products, totalProducts, isLoading, error, handlePageChange, currentPage } = useProduct(filters);
    const { createRating, updateRating, fetchUserRating, refetchRatings } = useRating();
    const { user } = useAuth();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ratingId, setRatingId] = useState();
    const [newRatingValue, setNewRatingValue] = useState();
    const [comment, setComment] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isCompareModalOpen, setCompareModalOpen] = useState(false);


    const totalPages = Math.ceil(totalProducts / filters.size);

    const handleRatingClick = async (product, value) => {
        setNewRatingValue(value);
        setSelectedProduct(product);
        setErrorMessage(null);
        if (!user) return;
        try {
            const existingRating = await fetchUserRating(product.id, user.id);
            setRatingId(existingRating?.id || 0);
            setComment(existingRating?.comment || "");
            setShowModal(true);
        } catch {
            setErrorMessage(translate("registered.userProductList.list.errorFetchingRating"));
        }
    };

    const handleSave = async (formData, ratingId) => {
        try {
            const ratingData = {
                ...formData,
                rating: newRatingValue,
                productId: selectedProduct?.id,
                userId: user?.id,
            };

            if (ratingId) {
                await updateRating({ id: ratingId, ratingData });
            } else {
                await createRating(ratingData);
            }

            setShowModal(false);
            refetchRatings();
        } catch {
            setErrorMessage(translate("registered.userProductList.list.errorSavingRating"));
        }
    };

    const openCompareModal = () => {
        if (selectedProducts.length > 1) {
            setCompareModalOpen(true);
        } else {
            setErrorMessage(translate("registered.userProductList.list.selectAtLeastTwo"));
        }
    };

    if (isLoading) {
        return <Typography variant="h6" sx={{ textAlign: "center", padding: 3 }}>{translate("shared.messages.loading")}</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error" sx={{ textAlign: "center", padding: 3 }}>{translate("registered.userProductList.list.errorLoadingProducts")}</Typography>;
    }

    return (
        <Container sx={{ padding: 3, textAlign: "center", marginBottom: "80px", paddingBottom: "80px" }}>
            {errorMessage && <Alert severity="error" sx={{ marginBottom: 2 }}>{errorMessage}</Alert>}

            {selectedProducts.length > 1 ? (
                <Button variant="contained" color="secondary" sx={{ display: "block", margin: "30px auto", padding: "10px 20px", fontSize: "1rem" }} onClick={openCompareModal}>
                    {translate("registered.comparison.compareNow")}
                </Button>
            ) : (
                <Typography variant="h4" sx={{ marginBottom: 3 }}>{translate("registered.userProductList.list.title")}</Typography>
            )}

            <ProductCardGrid
                products={products}
                user={user}
                fetchUserRating={fetchUserRating}
                handleRatingClick={handleRatingClick}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <Modal title={translate("registered.userProductList.card.rateProduct")} open={showModal} onClose={() => setShowModal(false)}>
                <RatingForm ratingId={ratingId} comment={comment} onSave={handleSave} setShowModal={setShowModal} newRating={newRatingValue} />
            </Modal>

            <CompareProductsModal open={isCompareModalOpen} onClose={() => setCompareModalOpen(false)} products={selectedProducts} />
        </Container>
    );
};

export default UserProductList;
