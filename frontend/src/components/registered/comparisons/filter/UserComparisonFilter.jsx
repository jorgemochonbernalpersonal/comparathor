import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";
import { TextField, FormControl} from "@mui/material";

const UserComparisonFilter = ({ open, onClose, onApplyFilters, comparisons = [] }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        brand: "",
        model: ""
    });

    useEffect(() => {
        if (open) {
            setFilters({
                name: searchParams.get("name") || "",
                category: searchParams.get("category") || "",
                price: searchParams.get("price") || "",
                stock: searchParams.get("stock") || "",
                description: searchParams.get("description") || "",
                brand: searchParams.get("brand") || "",
                model: searchParams.get("model") || ""
            });
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        const params = {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });

        setSearchParams(params);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        setFilters({
            name: "",
            category: "",
            price: "",
            stock: "",
            description: "",
            brand: "",
            model: ""
        });

        setSearchParams({});
        onApplyFilters({});
        onClose();
    };

    return (
        <FilterModal
            open={open}
            onClose={onClose}
            onClear={handleClearFilters}
            onApply={handleApplyFilters}
            title={translate("registered.comparison.filterTitle")}
        >
            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("registered.comparison.filterName")}
                    name="name"
                    value={filters.name}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("registered.comparison.filterCategory")}
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("registered.comparison.filterPrice")}
                    type="number"
                    name="price"
                    value={filters.price}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("registered.comparison.filterStock")}
                    type="number"
                    name="stock"
                    value={filters.stock}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("registered.comparison.filterDescription")}
                    name="description"
                    value={filters.description}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("registered.comparison.filterBrand")}
                    name="brand"
                    value={filters.brand}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("registered.comparison.filterModel")}
                    name="model"
                    value={filters.model}
                    onChange={handleChange}
                />
            </FormControl>
        </FilterModal>
    );
};

export default UserComparisonFilter;
