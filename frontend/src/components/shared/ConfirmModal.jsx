import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    return (
        <Dialog open={isOpen} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel} color="secondary">
                    Cancelar
                </Button>
                <Button variant="contained" startIcon={<DeleteIcon />} onClick={onConfirm} color="error">
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;
