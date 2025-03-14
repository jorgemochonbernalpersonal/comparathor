import React from "react";
import Modal from "./Modal"; 
import { translate } from "../../utils/Translate";

const FilterModal = ({ 
    open,
    onClose, 
    onClear, 
    onApply, 
    children, 
    title 
}) => {
    return (
        <Modal title={title} onClose={onClose} open={open}> 
            <div className="mb-3">
                {children} 
            </div>
            <div className="d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={onClear}>
                    {translate("shared.buttons.clear")}
                </button>
                <button className="btn btn-primary" onClick={onApply}>
                    {translate("shared.buttons.apply")}
                </button>
            </div>
        </Modal>
    );
};

export default FilterModal;
