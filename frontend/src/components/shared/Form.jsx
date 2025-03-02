import React from "react";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Form = ({ fields, onSubmit, submitText = "Enviar" }) => {
    const validationSchema = Yup.object(
        fields.reduce((schema, field) => {
            let validator;

            switch (field.type) {
                case "email":
                    validator = Yup.string()
                        .email("Please enter a valid email address.")
                        .required("The email is required.");
                    break;
                case "password":
                    validator = Yup.string()
                        .min(6, "The password must be at least 6 characters long.")
                        .required("The password is required.");
                    break;
                case "number":
                    validator = Yup.number()
                        .typeError("Please enter a valid number.")
                        .required("This field is required.");
                    break;
                case "checkbox":
                    validator = Yup.bool().oneOf([true], "You must accept the terms.");
                    break;
                default:
                    validator = Yup.string();
                    break;
            }

            if (field.required) {
                validator = validator.required(`The ${field.name} is required.`);
            }

            return { ...schema, [field.name]: validator };
        }, {})
    );

    const initialValues = fields.reduce(
        (values, field) => ({
            ...values,
            [field.name]: field.defaultValue || (field.type === "checkbox" ? false : ""),
        }),
        {}
    );

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ isSubmitting }) => (
                <FormikForm className="mt-4 mx-auto" style={{ maxWidth: "400px" }}>
                    {fields.map((field) => (
                        <div key={field.name} className="mb-3">
                            <label className="form-label">{field.label}</label>

                            {field.type === "textarea" ? (
                                <Field
                                    as="textarea"
                                    name={field.name}
                                    className="form-control"
                                    rows={field.rows || 3}
                                />
                            ) : field.type === "select" ? (
                                <Field as="select" name={field.name} className="form-control">
                                    <option value="">Seleccione una opción</option>
                                    {field.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Field>
                            ) : field.type === "radio" ? (
                                field.options.map((option) => (
                                    <div key={option.value} className="form-check">
                                        <Field
                                            type="radio"
                                            name={field.name}
                                            value={option.value}
                                            className="form-check-input"
                                        />
                                        <label className="form-check-label">{option.label}</label>
                                    </div>
                                ))
                            ) : field.type === "checkbox" ? (
                                <div className="form-check">
                                    <Field
                                        type="checkbox"
                                        name={field.name}
                                        className="form-check-input"
                                    />
                                    <label className="form-check-label">{field.label}</label>
                                </div>
                            ) : (
                                <Field type={field.type} name={field.name} className="form-control" />
                            )}

                            <ErrorMessage
                                name={field.name}
                                component="div"
                                className="text-danger"
                            />
                        </div>
                    ))}

                    <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : submitText}
                    </button>
                </FormikForm>
            )}
        </Formik>
    );
};

export default Form;
