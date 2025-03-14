import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";

const RoleFilters = ({ open, onClose, onApplyFilters }) => { 
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        roleName: "",
        startDate: "",
        endDate: "",
        updatedStartDate: "",
        updatedEndDate: "",
        roleCreatedBy: "",
    });

    const [dateError, setDateError] = useState("");

    useEffect(() => {
        if (open) {  // <-- Verificamos que `open` sea `true`
            setFilters({
                roleName: searchParams.get("roleName") || "",
                startDate: searchParams.get("startDate") || "",
                endDate: searchParams.get("endDate") || "",
                updatedStartDate: searchParams.get("updatedStartDate") || "",
                updatedEndDate: searchParams.get("updatedEndDate") || "",
                roleCreatedBy: searchParams.get("roleCreatedBy") || "",
            });
            setDateError("");
        }
    }, [open]);  // <-- Corregido

    const validateDates = (start, end) => {
        if (!start && !end) return true;
        if (!start || !end) {
            setDateError(translate("admin.role.filter.dateRequired"));
            return false;
        }
        if (new Date(start) > new Date(end)) {
            setDateError(translate("admin.role.filter.dateError"));
            return false;
        }
        setDateError("");
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => {
            const updatedFilters = { ...prev, [name]: value };
            if (name.includes("Date")) {
                validateDates(updatedFilters.startDate, updatedFilters.endDate);
                validateDates(updatedFilters.updatedStartDate, updatedFilters.updatedEndDate);
            }
            return updatedFilters;
        });
    };

    const handleApplyFilters = () => {
        if (validateDates(filters.startDate, filters.endDate) && validateDates(filters.updatedStartDate, filters.updatedEndDate)) {
            const params = {
                ...(filters.roleName && { roleName: filters.roleName }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.updatedStartDate && { updatedStartDate: filters.updatedStartDate }),
                ...(filters.updatedEndDate && { updatedEndDate: filters.updatedEndDate }),
                ...(filters.roleCreatedBy && { roleCreatedBy: filters.roleCreatedBy }),
            };

            setSearchParams(params);
            onApplyFilters(filters);
            onClose();
        }
    };

    const handleClearFilters = () => {
        setFilters({
            roleName: "",
            startDate: "",
            endDate: "",
            updatedStartDate: "",
            updatedEndDate: "",
            roleCreatedBy: "",
        });
        setDateError("");
        setSearchParams({});
        onApplyFilters({
            roleName: "",
            startDate: "",
            endDate: "",
            updatedStartDate: "",
            updatedEndDate: "",
            roleCreatedBy: "",
        });
        onClose();
    };

    return (
        <FilterModal
            open={open}  // <-- Corregido
            onClose={onClose}
            onClear={handleClearFilters}
            onApply={handleApplyFilters}
            title={translate("admin.role.filter.title")}
            disableApply={!!dateError}
        >
            <div className="mb-3">
                <label>{translate("admin.role.filter.roleName")}:</label>
                <input
                    type="text"
                    name="roleName"
                    className="form-control"
                    value={filters.roleName}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label>{translate("admin.role.filter.from")}:</label>
                <input
                    type="date"
                    name="startDate"
                    className={`form-control ${dateError ? "is-invalid" : ""}`}
                    value={filters.startDate}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label>{translate("admin.role.filter.to")}:</label>
                <input
                    type="date"
                    name="endDate"
                    className={`form-control ${dateError ? "is-invalid" : ""}`}
                    value={filters.endDate}
                    onChange={handleChange}
                />
                {dateError && <div className="text-danger">{dateError}</div>}
            </div>

            <div className="mb-3">
                <label>{translate("admin.role.filter.updatedFrom")}:</label>
                <input
                    type="date"
                    name="updatedStartDate"
                    className={`form-control ${dateError ? "is-invalid" : ""}`}
                    value={filters.updatedStartDate}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label>{translate("admin.role.filter.updatedTo")}:</label>
                <input
                    type="date"
                    name="updatedEndDate"
                    className={`form-control ${dateError ? "is-invalid" : ""}`}
                    value={filters.updatedEndDate}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label>{translate("admin.role.filter.createdBy")}:</label>
                <input
                    type="text"
                    name="roleCreatedBy"
                    className="form-control"
                    value={filters.roleCreatedBy}
                    onChange={handleChange}
                />
            </div>
        </FilterModal>
    );
};

export default RoleFilters;
