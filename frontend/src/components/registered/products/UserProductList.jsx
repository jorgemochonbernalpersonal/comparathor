import React, { useState } from "react";
import { Container, Typography, Button, Alert } from "@mui/material";
import { useProduct } from "../../../hooks/UseProduct";
import { useRating } from "../../../hooks/UseRating";
import { useAuth } from "../../../hooks/UseAuth";
import Modal from "../../../components/shared/Modal";
import ProductCardGrid from "./grid/ProductCardGrid";
import RatingForm from "./form/RatingForm";
import CompareProductsModal from "../comparisons/modal/CompareProductsModal";
import { translate } from "../../../utils/Translate";
import "../../../styles/registered/UserProductList.css";

const UserProductList = () => {
    const { products, isLoading, error } = useProduct();
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
        } catch (error) {
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

            const response = ratingId
                ? await updateRating({ id: ratingId, ratingData })
                : await createRating(ratingData);

            setShowModal(false);
            refetchRatings();
            return response;
        } catch (error) {
            setErrorMessage(translate("registered.userProductList.list.errorSavingRating"));
        }
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setShowModal(false);
    };

    const openCompareModal = () => {
        if (selectedProducts.length > 1) {
            setCompareModalOpen(true);
        } else {
            setErrorMessage(translate("registered.userProductList.list.selectAtLeastTwo"));
        }
    };

    if (isLoading) {
        return (
            <Typography variant="h6" sx={{ textAlign: "center", padding: 3 }}>
                {translate("shared.messages.loading")}
            </Typography>
        );
    }

    if (error) {
        return (
            <Typography variant="h6" color="error" sx={{ textAlign: "center", padding: 3 }}>
                ❌ {translate("registered.userProductList.list.errorLoadingProducts")}
            </Typography>
        );
    }

    return (
        <Container sx={{ padding: 3, textAlign: "center", marginBottom: "80px", paddingBottom: "80px" }}>
            {errorMessage && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            {selectedProducts.length > 1 ? (
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{ display: "block", margin: "30px auto", padding: "10px 20px", fontSize: "1rem" }}
                    onClick={openCompareModal}
                >
                    {translate("registered.comparison.compareNow")}
                </Button>
            ) : (
                <Typography variant="h4" sx={{ marginBottom: 3 }}>
                    {translate("registered.userProductList.list.title")}
                </Typography>
            )}

            <ProductCardGrid
                products={products}
                user={user}
                fetchUserRating={fetchUserRating}
                handleRatingClick={handleRatingClick}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
            />

            <Modal
                title={translate("registered.userProductList.card.rateProduct")}
                open={showModal}
                onClose={closeModal}
            >
                <RatingForm
                    ratingId={ratingId}
                    comment={comment}
                    onSave={handleSave}
                    setShowModal={setShowModal}
                    newRating={newRatingValue}
                />
            </Modal>

            <CompareProductsModal
                open={isCompareModalOpen}
                onClose={() => setCompareModalOpen(false)}
                products={selectedProducts}
                onSaveComparison={() => setCompareModalOpen(false)}
            />
        </Container>
    );
};

export default UserProductList;
