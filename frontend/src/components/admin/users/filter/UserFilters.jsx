import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";
import { TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from "@mui/material";

const UserFilters = ({ open, onClose, onApplyFilters, roles = [] }) => { 
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({ startDate: "", endDate: "", role_id: "" });
    const [dateError, setDateError] = useState("");

    useEffect(() => {
        if (open) {
            setFilters({
                startDate: searchParams.get("startDate") || "",
                endDate: searchParams.get("endDate") || "",
                role_id: searchParams.get("roleId") || "",
            });
            setDateError("");
        }
    }, [open]);

    const validateDates = (start, end) => {
        if (!start && !end) return setDateError(""), true;
        if (!start || !end) return setDateError(translate("admin.user.filter.dateRequired")), false;
        if (new Date(start) > new Date(end)) return setDateError(translate("admin.user.filter.dateError")), false;
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
            ...(filters.role_id && { roleId: filters.role_id }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
        };

        setSearchParams(params);
        onApplyFilters(filters);
        onClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = { startDate: "", endDate: "", role_id: "" };
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
            title={translate("admin.user.filter.title")}
            disableApply={!!dateError}
        >
            <FormControl fullWidth margin="normal">
                <TextField
                    label={translate("admin.user.filter.from")}
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
                    label={translate("admin.user.filter.to")}
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
                <InputLabel>{translate("admin.user.filter.role")}</InputLabel>
                <Select
                    name="role_id"
                    value={filters.role_id}
                    onChange={handleChange}
                >
                    <MenuItem value="">{translate("admin.user.filter.selectRole")}</MenuItem>
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                                {role.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>{translate("admin.user.filter.loadingRoles")}</MenuItem>
                    )}
                </Select>
                <FormHelperText>{translate("admin.user.filter.selectRole")}</FormHelperText>
            </FormControl>
        </FilterModal>
    );
};

export default UserFilters;
