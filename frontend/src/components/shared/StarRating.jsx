import React from "react";
import { Rating } from "@mui/material";

const StarRating = ({ value, onChange, readOnly = false, size = "medium" }) => {
    return (
        <Rating
            name="star-rating"
            value={value}
            precision={0.5} 
            onChange={(event, newValue) => {
                if (onChange) onChange(newValue);
            }}
            readOnly={readOnly}
            size={size}
        />
    );
};

export default StarRating;
