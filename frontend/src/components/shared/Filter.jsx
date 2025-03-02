import React, { useState } from "react";

const Filter = ({ onSearch, onOpenFilters, onCreate, FilterComponent, onFilter, closeModal }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div>
            {!FilterComponent ? (
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
                            Filters
                        </button>
                        <button className="btn btn-primary" type="button" onClick={onCreate}>
                            + Crear
                        </button>
                        
                    </div>
                </div>
            ) : (
                <FilterComponent onFilter={onFilter} closeModal={closeModal} />
            )}
        </div>
    );
};

export default Filter;
