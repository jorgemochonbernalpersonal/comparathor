import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

const Filter = ({ onSearch, onOpenFilters, onCreate, FilterComponent, onFilter, closeModal }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <Box>
            {!FilterComponent ? (
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <TextField
                        variant="outlined"
                        size="small"
                        label={t("shared.filter.searchPlaceholder")}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ maxWidth: "300px", mr: 2 }}
                        InputProps={{
                            endAdornment: (
                                <Button onClick={() => onSearch(searchTerm)} sx={{ minWidth: 40 }}>
                                    <SearchIcon />
                                </Button>
                            ),
                        }}
                    />

                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={onOpenFilters}
                            sx={{ mr: 2 }}
                        >
                            {t("shared.filter.filters")}
                        </Button>

                        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
                            {t("shared.filter.create")}
                        </Button>
                    </Box>
                </Box>
            ) : (
                <FilterComponent onFilter={onFilter} closeModal={closeModal} />
            )}
        </Box>
    );
};

export default Filter;
