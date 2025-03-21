import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, CardMedia, Typography, Button, Rating } from "@mui/material";
import { translate } from "../../../../utils/Translate";
import { DEFAULT_IMAGE_URL } from "../../../../utils/Constants";
import Pagination from "../../../shared/Pagination";

const ProductCardGrid = ({ 
    products, 
    user, 
    fetchUserRating, 
    handleRatingClick, 
    selectedProducts, 
    setSelectedProducts,
    currentPage,
    totalPages,
    onPageChange
}) => {
    const [ratings, setRatings] = useState({});

    useEffect(() => {
        if (!user || products.length === 0) return;

        const loadRatings = async () => {
            const ratingsPromises = products.map(async (product) => {
                const existingRating = await fetchUserRating(product.id, user.id);
                return { id: product.id, rating: existingRating?.rating || 0 };
            });

            const ratingsResults = await Promise.all(ratingsPromises);
            const ratingsMap = ratingsResults.reduce((acc, { id, rating }) => {
                acc[id] = rating;
                return acc;
            }, {});

            setRatings(ratingsMap);
        };

        loadRatings();
    }, [products, user, fetchUserRating]);

    const handleCompareClick = (product) => {
        setSelectedProducts((prevSelected) => {
            const isAlreadySelected = prevSelected.some((p) => p.id === product.id);
            if (isAlreadySelected) {
                return prevSelected.filter((p) => p.id !== product.id);
            }
            if (prevSelected.length < 3) {
                return [...prevSelected, product];
            }
            return prevSelected;
        });
    };

    return (
        <>
            <Grid container spacing={4} justifyContent="center" sx={{ marginBottom: 5 }}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} display="flex" justifyContent="center">
                        <Card sx={{ 
                            maxWidth: 350, 
                            width: "100%", 
                            minHeight: 520, 
                            display: "flex", 
                            flexDirection: "column", 
                            justifyContent: "space-between", 
                            padding: 1 
                        }}>
                            <CardMedia
                                component="img"
                                image={product.imageUrl?.startsWith("https://res.cloudinary.com") ? product.imageUrl : DEFAULT_IMAGE_URL}
                                alt={product.name}
                                sx={{ 
                                    height: 230, 
                                    objectFit: "cover", 
                                    borderRadius: "10px" 
                                }}
                            />
                            <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                                <Typography variant="h6">{product.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                                <Typography sx={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: 1 }}>
                                    {translate("registered.userProductList.card.price", { price: product.price })}
                                </Typography>
                                <Typography variant="body2">
                                    {translate("registered.userProductList.card.stock", { stock: product.stock })}
                                </Typography>
                                <Typography variant="body2">
                                    {translate("registered.userProductList.card.brand", { brand: product.brandName })}
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: 2 }}>
                                    {translate("registered.userProductList.card.model", { model: product.model })}
                                </Typography>

                                <Rating
                                    value={ratings[product.id] || 0}
                                    precision={0.5}
                                    onChange={(event, newValue) => handleRatingClick(product, newValue)}
                                    sx={{ cursor: "pointer", marginBottom: 1 }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={() => handleCompareClick(product)}
                                    sx={{ width: "100%", fontSize: "0.9rem", marginTop: 1 }}
                                >
                                    {selectedProducts.some((p) => p.id === product.id) ? 
                                        translate("registered.userProductList.card.removeCompare") : 
                                        translate("registered.userProductList.card.compare")}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={onPageChange} 
            />
        </>
    );
};

export default ProductCardGrid;
