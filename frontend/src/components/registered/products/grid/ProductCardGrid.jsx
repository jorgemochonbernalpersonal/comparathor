import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, CardMedia, Typography, Button, Rating } from "@mui/material";
import { translate } from "../../../../utils/Translate";

const ProductCardGrid = ({
    products,
    user,
    fetchUserRating,
    handleRatingClick,
    selectedProducts,
    setSelectedProducts
}) => {
    const [ratings, setRatings] = useState({});

    useEffect(() => {
        const loadRatings = async () => {
            if (!user) return;
            const ratingsData = {};
            for (const product of products) {
                const existingRating = await fetchUserRating(product.id, user.id);
                ratingsData[product.id] = existingRating?.rating || 0;
            }
            setRatings(ratingsData);
        };

        loadRatings();
    }, [products, user, fetchUserRating]);

    const handleCompareClick = (product) => {
        setSelectedProducts((prevSelected) => {
            const isAlreadySelected = prevSelected.some((p) => p.id === product.id);
            return isAlreadySelected
                ? prevSelected.filter((p) => p.id !== product.id)
                : prevSelected.length < 3
                ? [...prevSelected, product]
                : prevSelected;
        });
    };

    return (
        <Grid container spacing={4} justifyContent="center" sx={{ marginBottom: 5 }}>
            {products.map((product) => {
                const userRating = ratings[product.id] ?? 0;
                const isSelected = selectedProducts.some((p) => p.id === product.id);

                return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} display="flex" justifyContent="center">
                        <Card className={`product-card ${isSelected ? "selected" : ""}`}
                            sx={{
                                maxWidth: 280,
                                width: "100%",
                                minHeight: 400,
                            }}>
                            <CardMedia
                                component="img"
                                className="product-image"
                                image={product.imageUrl || "https://via.placeholder.com/200"}
                                alt={product.name}
                            />
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography className="product-title" variant="h6" sx={{ marginBottom: 1 }}>
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                                    {product.description}
                                </Typography>
                                <Typography className="product-price" sx={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: 1 }}>
                                    {translate("registered.userProductList.card.price", { price: product.price })}
                                </Typography>
                                <Typography variant="body2">
                                    {translate("registered.userProductList.card.stock", { stock: product.stock })}
                                </Typography>
                                <Typography variant="body2">
                                    {translate("registered.userProductList.card.brand", { brand: product.brand })}
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: 2 }}>
                                    {translate("registered.userProductList.card.model", { model: product.model })}
                                </Typography>

                                <Rating
                                    value={userRating}
                                    precision={0.5}
                                    onChange={(event, newValue) => handleRatingClick(product, newValue)}
                                    sx={{ cursor: "pointer", marginBottom: 1 }}
                                />

                                <Button
                                    variant={isSelected ? "outlined" : "contained"}
                                    color="primary"
                                    className="compare-button"
                                    sx={{ width: "100%", fontSize: "0.9rem", marginTop: 1 }}
                                    onClick={() => handleCompareClick(product)}
                                >
                                    {isSelected
                                        ? translate("registered.userProductList.card.removeCompare")
                                        : translate("registered.userProductList.card.compare")}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default ProductCardGrid;
