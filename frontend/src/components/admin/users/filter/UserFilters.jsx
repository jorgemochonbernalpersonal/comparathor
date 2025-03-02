import React, { useState } from "react";
import Modal from "../../../shared/Modal"; 

const UserFilters = ({ show, onClose, onApplyFilters, roles = [] }) => {
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        role_id: "",
    });

    const [dateError, setDateError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => {
            const updatedFilters = { ...prev, [name]: value };

            if (updatedFilters.startDate && updatedFilters.endDate) {
                const start = new Date(updatedFilters.startDate);
                const end = new Date(updatedFilters.endDate);

                if (start > end) {
                    setDateError("La fecha 'Hasta' no puede ser menor que 'Desde'");
                } else {
                    setDateError("");
                }
            }

            return updatedFilters;
        });
    };

    const handleApplyFilters = () => {
        if (!dateError) {
            onApplyFilters(filters);
            onClose();
        }
    };

    const handleClearFilters = () => {
        setFilters({ startDate: "", endDate: "", role_id: "" });
        setDateError("");
        onApplyFilters({ startDate: "", endDate: "", role_id: "" }); 
    };

    return (
        <Modal title="Filtros Avanzados" onClose={onClose} show={show}>
            <div className="mb-3">
                <label>Desde:</label>
                <input
                    type="date"
                    name="startDate"
                    className={`form-control ${dateError ? "is-invalid" : ""}`}
                    value={filters.startDate}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label>Hasta:</label>
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
                <label>Rol:</label>
                <select
                    name="role_id"
                    className="form-select"
                    value={filters.role_id}
                    onChange={handleChange}
                >
                    <option value="">Todos los Roles</option>
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <option key={role._id} value={role._id}>
                                {role.role}
                            </option>
                        ))
                    ) : (
                        <option disabled>Cargando roles...</option>
                    )}
                </select>
            </div>
            <div className="d-flex justify-content-between">
                <button className="btn btn-outline-danger" onClick={handleClearFilters}>
                    Limpiar Filtros
                </button>
                <div>
                    <button className="btn btn-secondary me-2" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleApplyFilters}
                        disabled={dateError}
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UserFilters;
