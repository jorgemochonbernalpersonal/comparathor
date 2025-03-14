import React, { useState } from "react";
import { Typography, Rating, Alert } from "@mui/material";
import Form from "../../../shared/Form";
import { translate } from "../../../../utils/Translate";

const RatingForm = ({ ratingId, comment, onSave, setShowModal, newRating }) => {
    const [errorMessage, setErrorMessage] = useState(null);

    const initialValues = {
        comment: comment.comment || "",
    };

    const fields = [
        { 
            name: "comment", 
            label: translate("registered.userProductList.form.commentLabel"), 
            type: "textarea" 
        },
    ];

    const handleSubmit = async (values, actions) => {
        setErrorMessage(null);
        actions.setSubmitting(true);
        try {
            const response = await onSave(values, ratingId);
            if (!response) throw new Error(translate("registered.userProductList.form.errorMessage"));

            setTimeout(() => {
                if (typeof setShowModal === "function") {
                    setShowModal(false);
                }
                actions.resetForm();
            }, 500);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <div>
            {errorMessage && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <Typography variant="h6" sx={{ textAlign: "center", marginBottom: 2 }}>
                {translate("registered.userProductList.form.ratingLabel")}
            </Typography>

            <div className="text-center" style={{ marginBottom: "15px" }}>
                <Rating value={newRating} precision={0.5} readOnly sx={{ fontSize: "2rem" }} />
            </div>

            <Form
                fields={fields}
                initialValues={initialValues}
                validationSchema={null}
                onSubmit={handleSubmit}
                submitText={ratingId 
                    ? translate("registered.userProductList.form.submitUpdate") 
                    : translate("registered.userProductList.form.submitCreate")
                }
            />
        </div>
    );
};

export default RatingForm;
