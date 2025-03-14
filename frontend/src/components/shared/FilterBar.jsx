import React, { useState } from "react";
import { TextField, Button, IconButton, InputAdornment, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { translate } from "../../utils/Translate";

const FilterBar = ({ onSearch, onOpenFilters, onCreate }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <TextField
                variant="outlined"
                placeholder={translate("shared.filterBar.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                sx={{ maxWidth: "300px" }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => onSearch(searchTerm)}>
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box display="flex" gap={1}>
                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={onOpenFilters}
                >
                    {translate("shared.filterBar.filters")}
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                >
                    {translate("shared.filterBar.create")}
                </Button>
            </Box>
        </Box>
    );
};

export default FilterBar;
