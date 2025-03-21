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

    const { comparisons, refetchComparisons } = useComparison(filters);

    useEffect(() => {
        refetchComparisons(filters);
    }, [filters, refetchComparisons]);

    const handleComparisonChange = (event) => {
        const value = event.target.value;
        if (value.length <= MAX_COMPARISONS) {
            setSelectedComparisons(value);
        } else {
            alert(`⚠️ Solo puedes seleccionar un máximo de ${MAX_COMPARISONS} comparaciones.`);
        }
    };

    const clearSelection = () => {
        setSelectedComparisons([]);
        setSearchParams({});
        refetchComparisons({});
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

    const displayedComparisons = useMemo(() => {
        if (selectedComparisons.length === 0) return comparisons;

        return comparisons.filter(comparison =>
            selectedComparisons.includes(comparison.id)
        );
    }, [comparisons, selectedComparisons]);

    return (
        <Box sx={{ maxWidth: "1300px", margin: "0 auto", padding: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
                {translate("registered.comparison.title")}
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
                        renderValue={(selected) => {
                            if (selected.length === 0) {
                                return translate("registered.comparison.list.selectComparison");
                            }
                            return selected
                                .map((id) => comparisons.find((c) => c.id === id)?.title)
                                .filter(Boolean)
                                .join(" vs ");
                        }}
                    >
                        {comparisons.map((comparison) => (
                            <MenuItem
                                key={comparison.id}
                                value={comparison.id}
                                disabled={
                                    selectedComparisons.length >= MAX_COMPARISONS &&
                                    !selectedComparisons.includes(comparison.id)
                                }
                            >
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
                    {translate("registered.comparison.list.noFilteredResults")}
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
                                                    ℹ️ {translate("registered.comparison.list.noComparison")}
                                                </Typography>
                                            ) : (
                                                <TableCompare
                                                    products={[...comparison.products].sort((a, b) => a.name.localeCompare(b.name))}
                                                    hoveredColumn={hoveredColumn}
                                                    setHoveredColumn={setHoveredColumn}
                                                    excludedFields={["id", "createdAt", "updatedAt"]}
                                                    columnNames={{
                                                        name: translate("registered.comparison.list.name"),
                                                        category: translate("registered.comparison.list.category"),
                                                        price: translate("registered.comparison.list.price"),
                                                        stock: translate("registered.comparison.list.stock"),
                                                        brand: translate("registered.comparison.list.brand"),
                                                        model: translate("registered.comparison.list.model"),
                                                        description: translate("registered.comparison.list.description"),
                                                        imageUrl: translate("registered.comparison.list.image"),
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
