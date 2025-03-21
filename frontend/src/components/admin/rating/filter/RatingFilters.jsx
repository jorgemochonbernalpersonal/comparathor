import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";
import {
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText
} from "@mui/material";

const RatingFilters = ({ open, onClose, onApplyFilters, users = [], products = [] }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        userId: "",
        productId: "",
        minRating: "",
        maxRating: "",
        startDate: "",
        endDate: ""
    });
    const [dateError, setDateError] = useState("");

    useEffect(() => {
        if (open) {
            setFilters({
                userId: searchParams.get("userId") || "",
                productId: searchParams.get("productId") || "",
                minRating: searchParams.get("minRating") || "",
                maxRating: searchParams.get("maxRating") || "",
                startDate: searchParams.get("startDate") || "",
                endDate: searchParams.get("endDate") || "",
            });
            setDateError("");
        }
    }, [open]);

    const validateDates = (startDate, endDate) => {
        if (!startDate && !endDate) return setDateError(""), true;
        if (!startDate || !endDate) return setDateError(translate("admin.rating.filter.dateRequired")), false;
        if (new Date(startDate) > new Date(endDate)) return setDateError(translate("admin.rating.filter.dateError")), false;
        return setDateError(""), true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => {
            const updatedFilters = { ...prev, [name]: value };
            validateDates(updatedFilters.startDate, updatedFilters.endDate);
            return updatedFilters;
        });
    };

    const handleApplyFilters = () => {
        if (!validateDates(filters.startDate, filters.endDate)) return;

        const params = {
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.productId && { productId: filters.productId }),
            ...(filters.minRating && { minRating: filters.minRating }),
            ...(filters.maxRating && { maxRating: filters.maxRating }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
        };

        setSearchParams(params);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            userId: "",
            productId: "",
            minRating: "",
            maxRating: "",
            startDate: "",
            endDate: ""
        };
        setFilters(clearedFilters);
        setDateError("");
        setSearchParams({});
        onApplyFilters(clearedFilters);
        onClose();
    };

    return (
        <FilterModal
            open={open}
            onClose={onClose}
            onClear={handleClearFilters}
            onApply={handleApplyFilters}
            title={translate("admin.rating.filter.title")}
            disableApply={!!dateError}
        >
            {/* Filtrar por Usuario */}
            <FormControl fullWidth margin="normal">
                <InputLabel>{translate("admin.rating.filter.user")}</InputLabel>
                <Select
                    name="userId"
                    value={filters.userId}
                    onChange={handleChange}
                >
                    <MenuItem value="">{translate("admin.rating.filter.selectUser")}</MenuItem>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>{translate("admin.rating.filter.loadingUsers")}</MenuItem>
                    )}
                </Select>
            </FormControl>

            {/* Filtrar por Producto */}
            <FormControl fullWidth margin="normal">
                <InputLabel>{translate("admin.rating.filter.product")}</InputLabel>
                <Select
                    name="productId"
                    value={filters.productId}
                    onChange={handleChange}
                >
                    <MenuItem value="">{translate("admin.rating.filter.selectProduct")}</MenuItem>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                                {product.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>{translate("admin.rating.filter.loadingProducts")}</MenuItem>
                    )}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.rating.filter.minRating")}
                    name="minRating"
                    type="number"
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                    value={filters.minRating}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.rating.filter.maxRating")}
                    name="maxRating"
                    type="number"
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                    value={filters.maxRating}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.rating.filter.startDate")}
                    type="date"
                    name="startDate"
                    InputLabelProps={{ shrink: true }}
                    value={filters.startDate}
                    onChange={handleChange}
                    error={!!dateError}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.rating.filter.endDate")}
                    type="date"
                    name="endDate"
                    InputLabelProps={{ shrink: true }}
                    value={filters.endDate}
                    onChange={handleChange}
                    error={!!dateError}
                    helperText={dateError}
                />
            </FormControl>
        </FilterModal>
    );
};

export default RatingFilters;
