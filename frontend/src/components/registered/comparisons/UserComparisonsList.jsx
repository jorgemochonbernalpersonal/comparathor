import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Typography, Paper, Alert, MenuItem, Select, Box, Grid, Button
} from "@mui/material";
import TableCompare from "../../shared/TableCompare";
import { useComparison } from "../../../hooks/UseComparison";
import UserComparisonFilter from "./filter/UserComparisonFilter";
import { translate } from "../../../utils/Translate";

const MAX_COMPARISONS = 3;

const UserComparisonsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedComparisons, setSelectedComparisons] = useState([]);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [hoveredColumn, setHoveredColumn] = useState(null);

    const filters = useMemo(() => ({
        name: searchParams.get("name") || "",
        category: searchParams.get("category") || "",
        price: searchParams.get("price") || "",
        stock: searchParams.get("stock") || "",
        brand: searchParams.get("brand") || "",
        model: searchParams.get("model") || "",
        sortField: searchParams.get("sortField") || "createdAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
    }), [searchParams]);

    const { comparisons, isLoading, error, refetchComparisons } = useComparison(filters, selectedComparisons);

    useEffect(() => {
        refetchComparisons(filters);
    }, [filters, refetchComparisons]);

    const handleComparisonChange = (event) => {
        const selected = event.target.value;
        if (selected.length > MAX_COMPARISONS) return;
        setSelectedComparisons(selected);
    };

    const clearSelection = () => {
        setSelectedComparisons([]);
    };

    const handleApplyFilters = (newFilters) => {
        setSearchParams({
            name: newFilters.name || "",
            category: newFilters.category || "",
            price: newFilters.price || "",
            stock: newFilters.stock || "",
            brand: newFilters.brand || "",
            model: newFilters.model || "",
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    const displayedComparisons = comparisons;

    return (
        <Box sx={{ maxWidth: "1300px", margin: "0 auto", padding: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
                {translate("registered.userComparisons.title")}
            </Typography>

            <UserComparisonFilter
                open={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApplyFilters={handleApplyFilters}
            />

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <Select
                        multiple
                        value={selectedComparisons}
                        onChange={handleComparisonChange}
                        displayEmpty
                        fullWidth
                        sx={{ mb: 2, bgcolor: "#f5f5f5", borderRadius: "8px" }}
                        renderValue={(selected) =>
                            selected.length === 0
                                ? translate("registered.comparison.selectComparison")
                                : selected.map((id) => displayedComparisons.find(c => c.id === id)?.title).join(" vs ")
                        }
                    >
                        {displayedComparisons.map((comparison) => (
                            <MenuItem key={comparison.id} value={comparison.id}>
                                {comparison.title}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>

                <Grid item xs={3}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={clearSelection}
                        fullWidth
                    >
                        {translate("shared.actions.clearSelection")}
                    </Button>
                </Grid>

                <Grid item xs={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowFiltersModal(true)}
                        fullWidth
                    >
                        {translate("shared.actions.filter")}
                    </Button>
                </Grid>
            </Grid>

            {displayedComparisons.length === 0 ? (
                <Alert severity="info" textAlign="center" sx={{ mt: 3 }}>
                    {translate("registered.comparison.noFilteredResults")}
                </Alert>
            ) : (
                selectedComparisons.length > 0 && (
                    <Paper sx={{ padding: 3, overflowX: "auto", borderRadius: "12px", boxShadow: 3 }}>
                        <Grid container spacing={2}>
                            {selectedComparisons.map((id) => {
                                const comparison = displayedComparisons.find(c => c.id === id);
                                if (!comparison) return null;

                                return (
                                    <Grid item xs={12} md={Math.floor(12 / selectedComparisons.length)} key={id}>
                                        <Paper sx={{ padding: 2, borderRadius: "8px", bgcolor: "#f9f9f9" }}>
                                            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
                                                {comparison.title}
                                            </Typography>

                                            {!comparison.products?.length ? (
                                                <Typography textAlign="center" padding={2}>
                                                    ℹ️ {translate("registered.comparison.noComparison")}
                                                </Typography>
                                            ) : (
                                                <TableCompare
                                                    products={[...comparison.products].sort((a, b) => a.name.localeCompare(b.name))}
                                                    hoveredColumn={hoveredColumn}
                                                    setHoveredColumn={setHoveredColumn}
                                                    excludedFields={["id", "createdAt", "updatedAt"]}
                                                    columnNames={{
                                                        name: translate("registered.comparison.name"),
                                                        category: translate("registered.comparison.category"),
                                                        price: translate("registered.comparison.price"),
                                                        stock: translate("registered.comparison.stock"),
                                                        brand: translate("registered.comparison.brand"),
                                                        model: translate("registered.comparison.model"),
                                                        description: translate("registered.comparison.description"),
                                                        imageUrl: translate("registered.comparison.image"),
                                                    }}
                                                />
                                            )}
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                )
            )}
        </Box>
    );
};

export default UserComparisonsList;
