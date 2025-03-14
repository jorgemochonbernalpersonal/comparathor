import React from "react";
import { TableContainer, Table, TableBody, TableRow, TableCell, Typography } from "@mui/material";

const TableCompare = ({
    title = "Comparison Table",
    products,
    excludedFields = [],
    columnNames = {},
    hoveredColumn,
    setHoveredColumn
}) => {
    if (!products || products.length === 0) {
        return <Typography variant="h6">No products available</Typography>;
    }

    const fields = Object.keys(products[0]).filter(field => !excludedFields.includes(field));

    return (
        <TableContainer sx={{ minWidth: "100%" }}>
            <Typography variant="h6" sx={{ marginBottom: 2, textAlign: "center", fontWeight: "bold" }}>
                {title}
            </Typography>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableBody>
                    {fields.map((field) => (
                        <TableRow
                            key={field}
                            sx={{
                                backgroundColor: hoveredColumn === field ? "#e0f7fa" : "inherit",
                                transition: "background-color 0.3s ease",
                                borderRadius: "8px"
                            }}
                            onMouseEnter={() => setHoveredColumn(field)}
                            onMouseLeave={() => setHoveredColumn(null)}
                        >
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: hoveredColumn === field ? "#e0f7fa" : "inherit",
                                    transition: "background-color 0.3s ease",
                                    minWidth: "120px"
                                }}
                            >
                                {columnNames[field] || field.charAt(0).toUpperCase() + field.slice(1)}
                            </TableCell>

                            {products.map((product, index) => (
                                <TableCell
                                    key={index}
                                    sx={{
                                        backgroundColor: hoveredColumn === field ? "#e0f7fa" : "inherit",
                                        transition: "background-color 0.3s ease",
                                        textAlign: "center"
                                    }}
                                >
                                    {field === "imageUrl" ? (
                                        <img
                                            src={product[field]}
                                            alt={field}
                                            style={{ width: "50px", height: "auto", borderRadius: "5px" }}
                                        />
                                    ) : (
                                        product[field]
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TableCompare;
