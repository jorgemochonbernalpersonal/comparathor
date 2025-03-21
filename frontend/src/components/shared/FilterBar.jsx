import React, { useState } from "react";
import {
    TextField, Button, IconButton, InputAdornment, Box, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import Modal from "../shared/Modal";
import { translate } from "../../utils/Translate";

const FilterBar = ({
    onSearch,
    onOpenFilters,
    onCreate,
    onUploadExcel,
    onUploadImagesZip,
    onDownloadTemplate,
    entityName,
    isUploading,
    isDownloading,
    showImageUpload = false
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [allowImageUpload, setAllowImageUpload] = useState(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadMessage("");
        setUploadSuccess(false);
        setIsProcessing(true);
        setErrorMessage("");
        setAllowImageUpload(false);

        setModalOpen(true);

        try {
            const result = await onUploadExcel(entityName, file);
            setIsProcessing(false);

            if (result.success) {
                setUploadSuccess(true);
                setUploadMessage(result.message);

                if (entityName === "products") {
                    setAllowImageUpload(true);
                } else {
                    setTimeout(() => setModalOpen(false), 1000);
                }
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            setIsProcessing(false);
            setErrorMessage("Error inesperado en la subida.");
        }
    };

    const handleZipUpload = async (event) => {
        if (!event?.target?.files?.length) return;
    
        const zipFile = event.target.files[0];
        if (!zipFile) return;
    
        setIsProcessing(true);
        setErrorMessage(null);
        setUploadSuccess(false);
    
        try {
            const response = await onUploadImagesZip(zipFile);
            setUploadSuccess(true);
            setTimeout(() => setModalOpen(false), 1000);
        } catch (error) {
            const errorMsg = error.message || "Error en la subida de imágenes.";
            setErrorMessage(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownloadTemplate = async () => {
        if (onDownloadTemplate) {
            await onDownloadTemplate(entityName, "xlsx");
        }
    };

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap">
                <TextField
                    variant="outlined"
                    placeholder={translate("shared.filterBar.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ maxWidth: "300px", flexGrow: 1 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => onSearch(searchTerm)} disabled={isUploading || isProcessing}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    disabled={isUploading || isProcessing}
                />

                <Box display="flex" gap={1} flexWrap="wrap">
                    <Button variant="outlined" startIcon={<FilterListIcon />} onClick={onOpenFilters} disabled={isUploading || isProcessing}>
                        {translate("shared.filterBar.filters")}
                    </Button>

                    {onCreate && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} disabled={isUploading || isProcessing}>
                            {translate("shared.filterBar.create")}
                        </Button>
                    )}

                    {onUploadExcel && (
                        <Button variant="contained" component="label" startIcon={<UploadFileIcon />} disabled={isUploading || isProcessing}>
                            {translate("shared.filterBar.uploadExcel")}
                            <input type="file" accept=".xlsx, .ods, .csv" hidden onChange={handleFileChange} />
                        </Button>
                    )}

                    {onDownloadTemplate && (
                        <Button variant="contained" startIcon={<DownloadIcon />}
                            onClick={handleDownloadTemplate}
                            disabled={isDownloading || isUploading || isProcessing}>
                            {translate("shared.filterBar.downloadTemplate")}
                        </Button>
                    )}
                </Box>
            </Box>

            <Modal title="Subiendo archivo..." open={modalOpen} onClose={!isProcessing && !allowImageUpload ? () => setModalOpen(false) : null}>
                {isProcessing ? (
                    <Box display="flex" alignItems="center" flexDirection="column">
                        <CircularProgress />
                        <p>Por favor espera, el archivo se está subiendo...</p>
                    </Box>
                ) : (
                    <Box>
                        {errorMessage && (
                            <Box mt={2} p={2} bgcolor="#ffeeee" border="1px solid red" borderRadius="4px">
                                <p style={{ color: "red" }}>{errorMessage}</p>
                            </Box>
                        )}

                        {uploadSuccess && showImageUpload && (
                            <Box mt={2}>
                                <p>¿Quieres subir imágenes para los productos? Si no, se usará una imagen por defecto.</p>
                                <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
                                    Subir ZIP de Imágenes
                                    <input type="file" accept=".zip" hidden onChange={handleZipUpload} />
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Modal>
        </>
    );
};

export default FilterBar;
