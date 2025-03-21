import React, { useState } from "react";
import { Button, TextField, Alert } from "@mui/material";
import { translate } from "../../../../utils/Translate";
import Modal from "../../../shared/Modal";
import { useAuth } from "../../../../hooks/UseAuth";
import { useComparison } from "../../../../hooks/UseComparison";
import TableCompare from "../../../shared/TableCompare";

const CompareProductsModal = ({ open, onClose, products }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { createComparison } = useComparison();
    const { user } = useAuth();
    const [hoveredColumn, setHoveredColumn] = useState(null);
    
    const handleSave = async () => {
        setErrorMessage("");

        if (!title.trim() || products.length === 0) {
            setErrorMessage("❌ Debes ingresar un título y seleccionar al menos un producto.");
            return;
        }

        if (!user || !user.id) {
            setErrorMessage("❌ No se pudo obtener el ID del usuario. Intenta iniciar sesión nuevamente.");
            return;
        }

        try {
            const comparisonData = {
                userId: user.id,
                title,
                description,
                productIds: products.map((product) => product.id),
            };
            await createComparison(comparisonData);
            onClose();
        } catch (error) {
            setErrorMessage(error.message || "❌ Error al guardar la comparación. Intenta nuevamente.");
        }
    };

    return (
        <Modal title={translate("registered.comparison.form.title")} open={open} onClose={onClose}>
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <TextField
                label={translate("registered.comparison.form.titleLabel")}
                placeholder={translate("registered.comparison.form.enterTitle")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            <TextField
                label={translate("registered.comparison.form.descriptionLabel")}
                placeholder={translate("registered.comparison.form.enterDescription")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            <TableCompare
                products={products}
                excludedFields={["id", "createdAt", "updatedAt"]}
                columnNames={{
                    category: translate("registered.comparison.form.category"),
                    price: translate("registered.comparison.form.price"),
                    stock: translate("registered.comparison.form.stock"),
                    description: translate("registered.comparison.form.description"),
                    brand: translate("registered.comparison.form.brand"),
                    model: translate("registered.comparison.form.model"),
                    imageUrl: translate("registered.comparison.form.image")
                }}
                hoveredColumn={hoveredColumn}
                setHoveredColumn={setHoveredColumn}
            />


            <Button
                onClick={handleSave}
                color="primary"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={!title.trim() || products.length === 0}
            >
                {translate("registered.comparison.form.saveComparison")}
            </Button>
        </Modal>
    );
};

export default CompareProductsModal;
