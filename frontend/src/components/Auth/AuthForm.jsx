import React from "react";
import Form from "../shared/Form";

const AuthForm = ({ title, fields, onSubmit, submitText }) => {
    return (
        <div className="container mt-5">
            <Form title={title} fields={fields} onSubmit={onSubmit} submitText={submitText} />
        </div>
    );
};

export default AuthForm;
