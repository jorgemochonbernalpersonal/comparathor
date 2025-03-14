import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../../../../api/products/ProductLogic"; 
import { translate } from "../../../../utils/Translate";
import FilterModal from "../../../shared/FilterModal";

const ProductFilters = ({ show, onClose, onApplyFilters }) => {
    // const [filters, setFilters] = useState({
    //     startDate: "",
    //     endDate: "",
    //     category: "",
    //     minPrice: "",
    //     maxPrice: "",
    // });

    // const [dateError, setDateError] = useState("");
    // const [priceError, setPriceError] = useState("");

    // const { data: categories, isLoading } = useQuery({
    //     queryKey: ["categories"],
    //     queryFn: fetchCategories, 
    //     staleTime: 5 * 60 * 1000, // Cache de 5 minutos
    // });

    // useEffect(() => {
    //     if (filters.startDate && filters.endDate) {
    //         const start = new Date(filters.startDate);
    //         const end = new Date(filters.endDate);
    //         setDateError(start > end ? translate("admin.product.filter.dateError") : "");
    //     } else {
    //         setDateError("");
    //     }

    //     if (filters.minPrice && filters.maxPrice) {
    //         setPriceError(parseFloat(filters.minPrice) > parseFloat(filters.maxPrice)
    //             ? translate("admin.product.filter.priceError")
    //             : ""
    //         );
    //     } else {
    //         setPriceError("");
    //     }
    // }, [filters.startDate, filters.endDate, filters.minPrice, filters.maxPrice]);

    // const handleChange = useCallback((e) => {
    //     const { name, value } = e.target;
    //     setFilters((prev) => ({ ...prev, [name]: value }));
    // }, []);

    // const handleApplyFilters = () => {
    //     if (!dateError && !priceError) {
    //         onApplyFilters(filters);
    //         onClose();
    //     }
    // };

    // const handleClearFilters = () => {
    //     setFilters({ startDate: "", endDate: "", category: "", minPrice: "", maxPrice: "" });
    //     setDateError("");
    //     setPriceError("");
    //     onApplyFilters({ startDate: "", endDate: "", category: "", minPrice: "", maxPrice: "" });
    //     onClose();
    // };

    // return (
    //     <FilterModal
    //         show={show}
    //         onClose={onClose}
    //         onClear={handleClearFilters}
    //         onApply={handleApplyFilters}
    //         title={translate("admin.product.filter.title")}
    //         disableApply={!!dateError || !!priceError}
    //     >
    //         <div className="mb-3">
    //             <label htmlFor="startDate">{translate("admin.product.filter.from")}:</label>
    //             <input
    //                 type="date"
    //                 id="startDate"
    //                 name="startDate"
    //                 className={`form-control ${dateError ? "is-invalid" : ""}`}
    //                 value={filters.startDate}
    //                 onChange={handleChange}
    //             />
    //         </div>
    //         <div className="mb-3">
    //             <label htmlFor="endDate">{translate("admin.product.filter.to")}:</label>
    //             <input
    //                 type="date"
    //                 id="endDate"
    //                 name="endDate"
    //                 className={`form-control ${dateError ? "is-invalid" : ""}`}
    //                 value={filters.endDate}
    //                 onChange={handleChange}
    //             />
    //             {dateError && <div className="text-danger">{dateError}</div>}
    //         </div>
    //         <div className="mb-3">
    //             <label htmlFor="category">{translate("admin.product.filter.category")}:</label>
    //             <select
    //                 id="category"
    //                 name="category"
    //                 className="form-select"
    //                 value={filters.category}
    //                 onChange={handleChange}
    //                 disabled={isLoading}
    //             >
    //                 <option value="">{translate("admin.product.filter.selectCategory")}</option>
    //                 {isLoading ? (
    //                     <option disabled>{translate("admin.product.filter.loadingCategories")}</option>
    //                 ) : (
    //                     categories?.map((cat) => (
    //                         <option key={cat.id || cat._id} value={cat.name}>
    //                             {cat.name}
    //                         </option>
    //                     ))
    //                 )}
    //             </select>
    //         </div>
    //         <div className="row">
    //             <div className="col-md-6">
    //                 <label htmlFor="minPrice">{translate("admin.product.filter.minPrice")}:</label>
    //                 <input
    //                     type="number"
    //                     id="minPrice"
    //                     name="minPrice"
    //                     className={`form-control ${priceError ? "is-invalid" : ""}`}
    //                     value={filters.minPrice}
    //                     onChange={handleChange}
    //                     placeholder="Ej: 10.00"
    //                 />
    //             </div>
    //             <div className="col-md-6">
    //                 <label htmlFor="maxPrice">{translate("admin.product.filter.maxPrice")}:</label>
    //                 <input
    //                     type="number"
    //                     id="maxPrice"
    //                     name="maxPrice"
    //                     className={`form-control ${priceError ? "is-invalid" : ""}`}
    //                     value={filters.maxPrice}
    //                     onChange={handleChange}
    //                     placeholder="Ej: 500.00"
    //                 />
    //             </div>
    //             {priceError && <div className="text-danger mt-2">{priceError}</div>}
    //         </div>
    //     </FilterModal>
    // );
};

export default ProductFilters;
