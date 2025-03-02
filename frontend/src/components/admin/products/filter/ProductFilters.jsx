import React, { useState } from "react";
import Modal from "../../../shared/Modal";

const ProductFilters = ({ show, onClose, onApplyFilters, categories = [] }) => {
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        category: "",
        minPrice: "",
        maxPrice: "",
    });

    const [dateError, setDateError] = useState("");
    const [priceError, setPriceError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => {
            const updatedFilters = { ...prev, [name]: value };

            if (updatedFilters.startDate && updatedFilters.endDate) {
                const start = new Date(updatedFilters.startDate);
                const end = new Date(updatedFilters.endDate);
                setDateError(start > end ? "La fecha 'Hasta' no puede ser menor que 'Desde'" : "");
            }

            if (updatedFilters.minPrice && updatedFilters.maxPrice) {
                setPriceError(parseFloat(updatedFilters.minPrice) > parseFloat(updatedFilters.maxPrice)
                    ? "El precio mínimo no puede ser mayor que el máximo"
                    : ""
                );
            }

            return updatedFilters;
        });
    };

    const handleApplyFilters = () => {
        if (!dateError && !priceError) {
            onApplyFilters(filters);
            onClose();
        }
    };

    const handleClearFilters = () => {
        setFilters({ startDate: "", endDate: "", category: "", minPrice: "", maxPrice: "" });
        setDateError("");
        setPriceError("");
        onApplyFilters({ startDate: "", endDate: "", category: "", minPrice: "", maxPrice: "" });
    };

    return (
        <Modal title="Filtros Avanzados de Productos" show={show} onClose={onClose}>
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
                <label>Categoría:</label>
                <select
                    name="category"
                    className="form-select"
                    value={filters.category}
                    onChange={handleChange}
                >
                    <option value="">Todas las Categorías</option>
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))
                    ) : (
                        <option disabled>Cargando categorías...</option>
                    )}
                </select>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <label>Precio Mínimo:</label>
                    <input
                        type="number"
                        name="minPrice"
                        className={`form-control ${priceError ? "is-invalid" : ""}`}
                        value={filters.minPrice}
                        onChange={handleChange}
                        placeholder="Ej: 10.00"
                    />
                </div>
                <div className="col-md-6">
                    <label>Precio Máximo:</label>
                    <input
                        type="number"
                        name="maxPrice"
                        className={`form-control ${priceError ? "is-invalid" : ""}`}
                        value={filters.maxPrice}
                        onChange={handleChange}
                        placeholder="Ej: 500.00"
                    />
                </div>
                {priceError && <div className="text-danger mt-2">{priceError}</div>}
            </div>
            <div className="d-flex justify-content-between mt-3">
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
                        disabled={dateError || priceError}
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProductFilters;
