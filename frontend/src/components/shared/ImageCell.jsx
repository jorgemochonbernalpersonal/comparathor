import React from "react";
import { DEFAULT_IMAGE_URL } from "../../utils/Constants";

const ImageCell = ({ value, alt = "Imagen", width = 50, height = 50 }) => {
    const imageUrl = value && value.trim() !== "" ? value : DEFAULT_IMAGE_URL;

    return (
        <img
            src={imageUrl}
            alt={alt}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                objectFit: "cover",
                borderRadius: "5px",
                border: "1px solid #ddd",
                padding: "2px",
            }}
            onError={(e) => {
                e.target.src = DEFAULT_IMAGE_URL; 
            }}
        />
    );
};

export default ImageCell;
