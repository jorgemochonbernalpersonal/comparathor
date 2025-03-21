import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";
import { TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from "@mui/material";

const CategoryFilters = ({ open, onClose, onApplyFilters }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({ startDate: "", endDate: "", color: "", isActive: "" });
    const [dateError, setDateError] = useState("");

    useEffect(() => {
        if (open) {
            setFilters({
                startDate: searchParams.get("startDate") || "",
                endDate: searchParams.get("endDate") || "",
                color: searchParams.get("color") || "",
                isActive: searchParams.get("isActive") || "",
            });
            setDateError("");
        }
    }, [open]);

    const validateDates = (start, end) => {
        if (!start && !end) return setDateError(""), true;
        if (!start || !end) return setDateError(translate("admin.category.filter.dateRequired")), false;
        if (new Date(start) > new Date(end)) return setDateError(translate("admin.category.filter.dateError")), false;
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
            ...(filters.color && { color: filters.color }),
            ...(filters.isActive !== "" && { isActive: filters.isActive }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
        };

        setSearchParams(params);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = { startDate: "", endDate: "", color: "", isActive: "" };
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
            title={translate("admin.category.filter.title")}
            disableApply={!!dateError}
        >
            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.category.filter.from")}
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
                    label={translate("admin.category.filter.to")}
                    type="date"
                    name="endDate"
                    InputLabelProps={{ shrink: true }}
                    value={filters.endDate}
                    onChange={handleChange}
                    error={!!dateError}
                    helperText={dateError}
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>{translate("admin.category.filter.color")}</InputLabel>
                <Select
                    name="color"
                    value={filters.color}
                    onChange={handleChange}
                >
                    <MenuItem value="">{translate("admin.category.filter.selectColor")}</MenuItem>
                    <MenuItem value="red">{translate("admin.category.filter.red")}</MenuItem>
                    <MenuItem value="blue">{translate("admin.category.filter.blue")}</MenuItem>
                    <MenuItem value="green">{translate("admin.category.filter.green")}</MenuItem>
                    <MenuItem value="yellow">{translate("admin.category.filter.yellow")}</MenuItem>
                    <MenuItem value="black">{translate("admin.category.filter.black")}</MenuItem>
                </Select>
                <FormHelperText>{translate("admin.category.filter.selectColor")}</FormHelperText>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>{translate("admin.category.filter.status")}</InputLabel>
                <Select
                    name="isActive"
                    value={filters.isActive}
                    onChange={handleChange}
                >
                    <MenuItem value="">{translate("admin.category.filter.selectStatus")}</MenuItem>
                    <MenuItem value="true">{translate("admin.category.filter.active")}</MenuItem>
                    <MenuItem value="false">{translate("admin.category.filter.inactive")}</MenuItem>
                </Select>
                <FormHelperText>{translate("admin.category.filter.selectStatus")}</FormHelperText>
            </FormControl>
        </FilterModal>
    );
};

export default CategoryFilters;
