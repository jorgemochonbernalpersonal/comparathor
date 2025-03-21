import React, { useState, useEffect } from "react";
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineOppositeContent,
    TimelineDot,
} from "@mui/lab";
import { Card, CardContent, Typography, Tooltip, Button, Box, Container, CardMedia, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { format } from "date-fns";
import { useRating } from "../../../hooks/UseRating";

const ITEMS_PER_PAGE = 5;

const UserRatings = () => {
    const [page, setPage] = useState(0);
    const [sortOrder, setSortOrder] = useState("desc"); // Orden por fecha
    const [minRating, setMinRating] = useState(1); // Cambia el valor mínimo por defecto a 1
    const [maxRating, setMaxRating] = useState(5); // Máximo por defecto es 5

    const {
        ratings = [],
        totalRatings = 0,
        isLoading,
        error,
        currentPage,
        handlePageChange,
    } = useRating({ page, size: ITEMS_PER_PAGE, sortField: "createdAt", sortOrder, minRating, maxRating });

    console.log(ratings);

    useEffect(() => {
        if (currentPage - 1 !== page) {
            setPage(currentPage - 1);
        }
    }, [currentPage]);

    const totalPages = Math.max(1, Math.ceil(totalRatings / ITEMS_PER_PAGE));

    // 🔹 Cambiar orden de fecha
    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
        setPage(0);
        handlePageChange(1, "createdAt", event.target.value, minRating, maxRating);
    };

    // 🔹 Cambiar filtro de rating mínimo
    const handleRatingChange = (event) => {
        const newMinRating = event.target.value;
        if (newMinRating > maxRating) {
            setMaxRating(newMinRating); // Ajusta el máximo si el mínimo es mayor
        }
        setMinRating(newMinRating);
        setPage(0);
        handlePageChange(1, "createdAt", sortOrder, newMinRating, maxRating);
    };

    // 🔹 Cambiar filtro de rating máximo
    const handleMaxRatingChange = (event) => {
        const newMaxRating = event.target.value;
        if (newMaxRating < minRating) {
            setMinRating(newMaxRating); // Ajusta el mínimo si el máximo es menor
        }
        setMaxRating(newMaxRating);
        setPage(0);
        handlePageChange(1, "createdAt", sortOrder, minRating, newMaxRating);
    };

    if (isLoading) return <Typography>Cargando ratings...</Typography>;
    if (error) return <Typography>Error al cargar los ratings</Typography>;

    return (
        <Container sx={{ padding: 3, textAlign: "center", marginBottom: "80px", paddingBottom: "80px" }}>
            {/* 📌 Selects para ordenar y filtrar */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mb: 2 }}>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Ordenar por</InputLabel>
                    <Select value={sortOrder} onChange={handleSortChange} label="Ordenar por">
                        <MenuItem value="desc">Más Reciente</MenuItem>
                        <MenuItem value="asc">Más Antiguo</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="outlined" size="small">
                    <InputLabel>Filtrar por Rating Mínimo</InputLabel>
                    <Select value={minRating} onChange={handleRatingChange} label="Filtrar por Rating Mínimo">
                        <MenuItem value={1}>1 ⭐ o más</MenuItem>
                        <MenuItem value={2}>2 ⭐ o más</MenuItem>
                        <MenuItem value={3}>3 ⭐ o más</MenuItem>
                        <MenuItem value={4}>4 ⭐ o más</MenuItem>
                        <MenuItem value={5}>5 ⭐ solamente</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="outlined" size="small">
                    <InputLabel>Filtrar por Rating Máximo</InputLabel>
                    <Select value={maxRating} onChange={handleMaxRatingChange} label="Filtrar por Rating Máximo">
                        <MenuItem value={5}>5 ⭐ o menos</MenuItem>
                        <MenuItem value={4}>4 ⭐ o menos</MenuItem>
                        <MenuItem value={3}>3 ⭐ o menos</MenuItem>
                        <MenuItem value={2}>2 ⭐ o menos</MenuItem>
                        <MenuItem value={1}>1 ⭐ solamente</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* 📜 Línea de Tiempo */}
            <Timeline position="alternate">
                {ratings.map((rating) => {
                    const product = rating.product || {};

                    return (
                        <TimelineItem key={rating.id}>
                            <TimelineOppositeContent color="textSecondary">
                                {format(new Date(rating.createdAt), "MMMM yyyy")}
                            </TimelineOppositeContent>

                            <TimelineSeparator>
                                <Tooltip title={`Calificación: ${rating.rating} ⭐`} arrow>
                                    <TimelineDot color={rating.rating >= 4 ? "success" : "warning"}>
                                        <Typography fontSize={20}>
                                            {"⭐".repeat(Math.round(rating.rating))}
                                        </Typography>
                                    </TimelineDot>
                                </Tooltip>
                                <TimelineConnector />
                            </TimelineSeparator>

                            <TimelineContent>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        maxWidth: 350,
                                        cursor: "pointer",
                                        "&:hover": { boxShadow: 3 },
                                        backgroundColor: rating.rating >= 4 ? "#E3F2FD" : "#FFEBEE",
                                    }}
                                >
                                    {product.imageUrl ? (
                                        <CardMedia
                                            component="img"
                                            height="150"
                                            image={product.imageUrl}
                                            alt={product.name || "Producto"}
                                        />
                                    ) : (
                                        <Box sx={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
                                            <Typography variant="body2" color="text.secondary">Sin imagen</Typography>
                                        </Box>
                                    )}

                                    <CardContent>
                                        <Typography variant="h6">{product.name || "Producto desconocido"}</Typography>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            <strong>Model:</strong> {product.model || "N/A"} | <strong>Brand:</strong> {product.brand || "N/A"}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Category:</strong> {product.category || "N/A"} | <strong>Stock:</strong> {product.stock ?? "N/A"}
                                        </Typography>

                                        <Typography variant="body2" color="text.primary">
                                            {rating.comment || "Sin comentario"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        </Container>
    );
};

export default UserRatings;
