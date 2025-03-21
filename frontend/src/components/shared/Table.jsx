import React, { useState, useEffect } from "react";
import { Alert, Button, IconButton } from "@mui/material";
import { translate } from "../../utils/Translate";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";

const breakpoints = {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200,
};

const Table = ({
    columns,
    data,
    actions,
    currentPage,
    totalPages,
    onPageChange,
    onSort,
    sortField,
    sortOrder,
    hiddenColumnsBreakpoints
}) => {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [expandedRows, setExpandedRows] = useState({});
    const [pendingAction, setPendingAction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setExpandedRows({});
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isXs = screenWidth <= breakpoints.xs;
    const isSm = screenWidth > breakpoints.xs && screenWidth <= breakpoints.sm;
    const isMd = screenWidth > breakpoints.sm && screenWidth <= breakpoints.md;
    const isLg = screenWidth > breakpoints.md;

    const toggleRowExpansion = (index) => {
        setExpandedRows((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const shouldHideColumn = (label) => (
        (isXs && hiddenColumnsBreakpoints?.xs?.includes(label)) ||
        (isSm && hiddenColumnsBreakpoints?.sm?.includes(label)) ||
        (isMd && hiddenColumnsBreakpoints?.md?.includes(label)) ||
        (isLg && hiddenColumnsBreakpoints?.lg?.includes(label))
    );

    const shouldShowExpandButton = () => (
        (isMd && hiddenColumnsBreakpoints?.md?.length > 0) ||
        (isSm && hiddenColumnsBreakpoints?.sm?.length > 0) ||
        (isLg && hiddenColumnsBreakpoints?.lg?.length > 0) ||
        (isXs && hiddenColumnsBreakpoints?.xs?.length > 0)
    );

    const getSortIcon = (columnField) => {
        if (sortField !== columnField) return "⇅";
        return sortOrder === "asc" ? "▲" : "▼";
    };

    const handleAction = (action, row) => {
        if (action.label.includes("🗑️")) {
            setSelectedRow(row);
            setPendingAction(() => () => action.handler(row));
            setIsModalOpen(true);
        } else {
            action.handler(row);
        }
    };

    return (
        <div className="table-container mb-5">
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                        <tr>
                            {shouldShowExpandButton() && (
                                <th className="text-center">+</th>
                            )}
                            {columns.map((col, index) => (
                                !shouldHideColumn(col.label) && (
                                    <th
                                        key={index}
                                        className="text-nowrap sortable-th"
                                        onClick={() => onSort?.(col.field)}
                                        style={{ cursor: "pointer", userSelect: "none" }}
                                    >
                                        {col.label}
                                        {onSort && (
                                            <span className="sort-icon" style={{ marginLeft: "5px" }}>
                                                {getSortIcon(col.field)}
                                            </span>
                                        )}
                                    </th>
                                )
                            ))}
                            {actions?.length > 0 && (
                                <th className="text-nowrap text-center">{translate("shared.table.action")}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <React.Fragment key={row.id || rowIndex}>
                                    <tr>
                                        {shouldShowExpandButton() && (
                                            <td className="text-center">
                                                <IconButton
                                                    size="small"
                                                    color={expandedRows[rowIndex] ? "error" : "primary"}
                                                    onClick={() => toggleRowExpansion(rowIndex)}
                                                >
                                                    {expandedRows[rowIndex] ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </td>
                                        )}
                                        {columns.map((col, colIndex) =>
                                            !shouldHideColumn(col.label) && (
                                                <td key={colIndex} className="text-nowrap">
                                                    {typeof col.render === "function" ? col.render(row) : row[col.field] || "N/A"}
                                                </td>
                                            )
                                        )}
                                        {actions?.length > 0 && (
                                            <td className="text-center">
                                                <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                    {actions.map((action, actionIndex) => (
                                                        <Button
                                                            key={actionIndex}
                                                            variant={action.type === "danger" ? "contained" : "outlined"}
                                                            color={action.type === "danger" ? "error" : "primary"}
                                                            size="small"
                                                            onClick={() => handleAction(action, row)}
                                                            sx={{ margin: "2px" }}
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {expandedRows[rowIndex] && (
                                        <tr>
                                            <td colSpan={columns.length + (actions ? 1 : 0)} className="expanded-row">
                                                <div className="p-3 border rounded bg-light">
                                                    {columns.map((col, colIndex) =>
                                                        shouldHideColumn(col.label) && (
                                                            <p key={colIndex} className="mb-1">
                                                                <strong>{col.label}:</strong>{" "}
                                                                {typeof col.render === "function" ? col.render(row) : row[col.field] || "N/A"}
                                                            </p>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0) + (shouldShowExpandButton() ? 1 : 0)}>
                                    <Alert severity="info" sx={{ textAlign: "center", margin: 3 }}>
                                        ℹ️ {translate("shared.table.notData")}
                                    </Alert>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <ConfirmModal
                isOpen={isModalOpen}
                title="Confirmar eliminación"
                message={selectedRow ? `¿Estás seguro de que deseas eliminar "${selectedRow.name}"?` : ""}
                onConfirm={() => {
                    pendingAction();
                    setIsModalOpen(false);
                }}
                onCancel={() => setIsModalOpen(false)}
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
};

export default Table;
