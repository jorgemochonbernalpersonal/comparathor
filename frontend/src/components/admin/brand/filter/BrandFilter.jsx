import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";
import { TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from "@mui/material";

const BrandFilters = ({ open, onClose, onApplyFilters }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({ startDate: "", endDate: "", reliability: "", isActive: "" });
    const [dateError, setDateError] = useState("");

    useEffect(() => {
        if (open) {
            setFilters({
                startDate: searchParams.get("startDate") || "",
                endDate: searchParams.get("endDate") || "",
                reliability: searchParams.get("reliability") || "",
                isActive: searchParams.get("isActive") || "",
            });
            setDateError("");
        }
    }, [open]);

    const validateDates = (start, end) => {
        if (!start && !end) return setDateError(""), true;
        if (!start || !end) return setDateError(translate("admin.brand.filter.dateRequired")), false;
        if (new Date(start) > new Date(end)) return setDateError(translate("admin.brand.filter.dateError")), false;
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
            ...(filters.reliability && { reliability: filters.reliability }),
            ...(filters.isActive !== "" && { isActive: filters.isActive }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
        };

        setSearchParams(params);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = { startDate: "", endDate: "", reliability: "", isActive: "" };
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
            title={translate("admin.brand.filter.title")}
            disableApply={!!dateError}
        >
            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.brand.filter.from")}
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
                    label={translate("admin.brand.filter.to")}
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
                <InputLabel>{translate("admin.brand.filter.reliability")}</InputLabel>
                <Select
                    name="reliability"
                    value={filters.reliability}
                    onChange={handleChange}
                >
                    <MenuItem value="">{translate("admin.brand.filter.selectReliability")}</MenuItem>
                    {[1, 2, 3, 4, 5].map((value) => (
                        <MenuItem key={value} value={value}>
                            {`${value} ⭐`}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{translate("admin.brand.filter.selectReliability")}</FormHelperText>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>{translate("admin.brand.filter.status")}</InputLabel>
                <Select
                    name="isActive"
                    value={filters.isActive}
                    onChange={handleChange}
                >
                    <MenuItem value="">{translate("admin.brand.filter.selectStatus")}</MenuItem>
                    <MenuItem value="true">{translate("admin.brand.filter.active")}</MenuItem>
                    <MenuItem value="false">{translate("admin.brand.filter.inactive")}</MenuItem>
                </Select>
                <FormHelperText>{translate("admin.brand.filter.selectStatus")}</FormHelperText>
            </FormControl>
        </FilterModal>
    );
};

export default BrandFilters;
