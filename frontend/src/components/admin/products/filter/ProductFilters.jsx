import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";
import { TextField, FormControl } from "@mui/material";

const ProductFilters = ({ open, onClose, onApplyFilters }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        minStock: "",
        maxStock: "",
        startDate: "",
        endDate: ""
    });
    const [error, setError] = useState({});

    useEffect(() => {
        if (open) {
            setFilters({
                minPrice: searchParams.get("minPrice") || "",
                maxPrice: searchParams.get("maxPrice") || "",
                minStock: searchParams.get("minStock") || "",
                maxStock: searchParams.get("maxStock") || "",
                startDate: searchParams.get("startDate") || "",
                endDate: searchParams.get("endDate") || "",
            });
            setError({});
        }
    }, [open]);

    const validateInputs = (updatedFilters) => {
        let errors = {};

        if (updatedFilters.startDate && updatedFilters.endDate) {
            if (new Date(updatedFilters.startDate) > new Date(updatedFilters.endDate)) {
                errors.dateError = translate("admin.product.filter.dateError");
            }
        }

        if (updatedFilters.minPrice && updatedFilters.maxPrice) {
            if (parseFloat(updatedFilters.minPrice) > parseFloat(updatedFilters.maxPrice)) {
                errors.priceError = translate("admin.product.filter.priceRangeError");
            }
        }

        if (updatedFilters.minStock && updatedFilters.maxStock) {
            if (parseInt(updatedFilters.minStock) > parseInt(updatedFilters.maxStock)) {
                errors.stockError = translate("admin.product.filter.stockRangeError");
            }
        }

        setError(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => {
            const updatedFilters = { ...prev, [name]: value };
            validateInputs(updatedFilters);
            return updatedFilters;
        });
    };
    

    const handleApplyFilters = () => {
        if (!validateInputs(filters)) return;
        const params = {
            ...(filters.minPrice && { minPrice: filters.minPrice }),
            ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
            ...(filters.minStock && { minStock: filters.minStock }),
            ...(filters.maxStock && { maxStock: filters.maxStock }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
        };
        setSearchParams(params);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            minPrice: "",
            maxPrice: "",
            minStock: "",
            maxStock: "",
            startDate: "",
            endDate: ""
        };
        setFilters(clearedFilters);
        setError({});
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
            title={translate("admin.product.filter.title")}
            disableApply={Object.keys(error).length > 0}
        >
            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.product.filter.minPrice")}
                    name="minPrice"
                    type="number"
                    value={filters.minPrice}
                    onChange={handleChange}
                    error={!!error.priceError}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.product.filter.maxPrice")}
                    name="maxPrice"
                    type="number"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    error={!!error.priceError}
                    helperText={error.priceError}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.product.filter.minStock")}
                    name="minStock"
                    type="number"
                    value={filters.minStock}
                    onChange={handleChange}
                    error={!!error.stockError}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.product.filter.maxStock")}
                    name="maxStock"
                    type="number"
                    value={filters.maxStock}
                    onChange={handleChange}
                    error={!!error.stockError}
                    helperText={error.stockError}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.product.filter.startDate")}
                    type="date"
                    name="startDate"
                    InputLabelProps={{ shrink: true }}
                    value={filters.startDate}
                    onChange={handleChange}
                    error={!!error.dateError}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.product.filter.endDate")}
                    type="date"
                    name="endDate"
                    InputLabelProps={{ shrink: true }}
                    value={filters.endDate}
                    onChange={handleChange}
                    error={!!error.dateError}
                    helperText={error.dateError}
                />
            </FormControl>
        </FilterModal>
    );
};

export default ProductFilters;
