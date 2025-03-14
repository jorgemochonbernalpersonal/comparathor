import React, { useState } from "react";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Typography
} from "@mui/material";
import { translate } from "../../utils/Translate";

const Form = ({ fields, initialValues, validationSchema, onSubmit, submitText = translate("shared.buttons.save"), handleImageChange }) => {
    const [imagePreview, setImagePreview] = useState(initialValues.image || null);

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting, setFieldValue }) => (
                <FormikForm style={{ maxWidth: "400px", margin: "auto", marginTop: "20px" }}>
                    {fields.map((field) => (
                        <div key={field.name} style={{ marginBottom: "16px" }}>
                            {field.type === "file" ? (
                                <>
                                    {imagePreview && (
                                        <div style={{ textAlign: "center", marginBottom: "10px" }}>
                                            <Typography variant="subtitle2">{translate("shared.form.imagePreview")}</Typography>
                                            <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }} />
                                        </div>
                                    )}
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type="file"
                                        accept={field.accept || "image/*"}
                                        onChange={(event) => {
                                            handleImageChange(event, setFieldValue);
                                            const file = event.target.files[0];
                                            if (file) {
                                                setImagePreview(URL.createObjectURL(file));
                                            } else {
                                                setImagePreview(initialValues.image || null);
                                            }
                                        }}
                                        style={{ display: "block", width: "100%", marginTop: "8px" }}
                                    />
                                </>
                            ) : field.type === "select" ? (
                                <FormControl fullWidth>
                                    <InputLabel>{field.label}</InputLabel>
                                    <Field as={Select} name={field.name}>
                                        {field.options.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Field>
                                    <ErrorMessage name={field.name} component={FormHelperText} error />
                                </FormControl>
                            ) : field.type === "textarea" ? (
                                <Field
                                    as={TextField}
                                    fullWidth
                                    multiline
                                    rows={field.rows || 3}
                                    label={field.label}
                                    name={field.name}
                                    variant="outlined"
                                />
                            ) : field.type === "checkbox" ? (
                                <FormControlLabel
                                    control={<Field as={Checkbox} name={field.name} />}
                                    label={field.label}
                                />
                            ) : (
                                <Field
                                    as={TextField}
                                    fullWidth
                                    label={field.label}
                                    name={field.name}
                                    type={field.type}
                                    variant="outlined"
                                    autoComplete={field.type === "password" ? "off" : "on"}
                                />
                            )}
                            <ErrorMessage name={field.name} component={FormHelperText} error />
                        </div>
                    ))}

                    <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : submitText}
                    </Button>
                </FormikForm>
            )}
        </Formik>
    );
};

export default Form;
