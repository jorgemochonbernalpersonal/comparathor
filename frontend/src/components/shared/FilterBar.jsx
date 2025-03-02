import React, { useState } from "react";

const FilterBar = ({ onSearch, onOpenFilters, onCreate }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="input-group" style={{ maxWidth: "300px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => onSearch(searchTerm)}>
                    🔍
                </button>
            </div>
            <div>
                <button className="btn btn-outline-primary me-2" type="button" onClick={onOpenFilters}>
                    Filtros
                </button>
                <button className="btn btn-primary" type="button" onClick={onCreate}>
                    + Crear
                </button>
            </div>
        </div>
    );
};

export default FilterBar;
