import React from "react";

const Table = ({
    columns,
    data,
    actions,
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange
}) => {
    const getNestedValue = (obj, path) => {
        if (typeof path === "function") {
            return path(obj);
        }
        return path.split('.').reduce((acc, key) => acc?.[key], obj) || "N/A";
    };


    const totalPages = Math.ceil(totalItems / itemsPerPage);

    console.log(itemsPerPage)

    return (
        <div className="table-responsive">
            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.label}</th>
                        ))}
                        {actions && actions.length > 0 && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => {
                                    const value = getNestedValue(row, col.field);

                                    return (
                                        <td key={colIndex}>
                                            {typeof value === "string" && value.startsWith("/uploads/") ? (
                                                <img
                                                    src={`http://127.0.0.1:8000${value}`}
                                                    alt="Imagen"
                                                    className="img-thumbnail"
                                                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                                />
                                            ) : (
                                                value
                                            )}
                                        </td>
                                    );
                                })}
                                {actions && actions.length > 0 && (
                                    <td>
                                        {actions.map((action, actionIndex) => (
                                            <button
                                                key={actionIndex}
                                                className={`btn btn-${action.type} btn-sm me-2`}
                                                onClick={() => action.handler(row)}
                                                aria-label={action.label}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center">
                                No hay datos disponibles
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <button
                        className="btn btn-secondary me-2"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ⬅️ Anterior
                    </button>
                    <span className="align-self-center">Página {currentPage} de {totalPages}</span>
                    <button
                        className="btn btn-secondary ms-2"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Siguiente ➡️
                    </button>
                </div>
            )}
        </div>
    );
};

export default Table;
