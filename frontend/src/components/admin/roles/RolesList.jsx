import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useRole } from "../../../hooks/UseRole";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import FilterBar from "../../shared/FilterBar";
import RoleFilters from "./filter/RolesFilter";
import Modal from "../../shared/Modal";
import RoleForm from "./form/RoleForm";
import LoadingSpinner from "../../shared/LoadingSpinner";

const RoleList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedRole, setSelectedRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const filters = useMemo(() => ({
        search: searchParams.get("search") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        updatedStartDate: searchParams.get("updatedStartDate") || "",
        updatedEndDate: searchParams.get("updatedEndDate") || "",
        roleCreatedBy: searchParams.get("roleCreatedBy") || "",
        sortField: searchParams.get("sortField") || "createdAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
    }), [searchParams]);

    const {
        roles, isLoading, error, refetchRoles,
        addRole, updateRole, deleteRole,
        sortField, sortOrder, handleSort
    } = useRole(filters);

    useEffect(() => {
        refetchRoles();
    }, [filters, refetchRoles]);

    const openModal = (role = null) => {
        setSelectedRole(role);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedRole(null);
        setShowModal(false);
    };

    const handleSave = async (formData, roleId) => {
        roleId
            ? await updateRole({ roleId, updatedData: formData })
            : await addRole(formData);
        refetchRoles();
        closeModal();
    };

    const handleDelete = async (role) => {
        await deleteRole(role.id);
        await refetchRoles();
        window.location.reload()
    };

    const handleSortWrapper = (field) => {
        const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
        setSearchParams(prevParams => ({
            ...Object.fromEntries(prevParams.entries()),
            sortField: field,
            sortOrder: newOrder,
        }));

        handleSort(field);
    };

    const handleApplyFilters = (newFilters) => {
        setSearchParams({
            search: newFilters.search || "",
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
            updatedStartDate: newFilters.updatedStartDate || "",
            updatedEndDate: newFilters.updatedEndDate || "",
            roleCreatedBy: newFilters.roleCreatedBy || "",
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), search: term }))}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={() => openModal()}
            />

            <div className="mb-3">
                {filters.search && <span className="badge bg-info me-2">🔍 {filters.search}</span>}
                {filters.startDate && <span className="badge bg-warning me-2">📅 {filters.startDate}</span>}
                {filters.endDate && <span className="badge bg-warning me-2">📅 {filters.endDate}</span>}
                {filters.roleCreatedBy && <span className="badge bg-primary me-2">👤 {filters.roleCreatedBy}</span>}
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <LoadingSpinner size="medium" color="#007BFF" />
                </div>
            ) : roles.length > 0 ? (
                <Table
                    title={translate("admin.role.list.roleList")}
                    columns={[
                        { label: translate("admin.role.list.name"), field: "name" },
                        { label: translate("admin.role.list.description"), field: "description" },
                        {
                            label: translate("admin.role.list.createdAt"),
                            field: "createdAt",
                            render: (row) => <CellDate value={row.createdAt} />,
                        },
                        {
                            label: translate("admin.role.list.updatedAt"),
                            field: "updatedAt",
                            render: (row) => <CellDate value={row.updatedAt} />,
                        },
                        {
                            label: translate("admin.role.list.createdBy"),
                            field: "roleCreatedBy",
                        },
                    ]}
                    data={roles}
                    actions={[
                        { label: `✏️ ${translate("admin.role.list.edit")}`, type: "primary", handler: openModal },
                        { label: `🗑️ ${translate("admin.role.list.delete")}`, type: "danger", handler: handleDelete },
                    ]}
                    hiddenColumnsBreakpoints={{
                        xs: [translate("admin.role.list.updatedAt"), translate("admin.role.list.description"), translate("admin.role.list.createdAt"), translate("admin.role.list.createdBy")],
                        sm: [translate("admin.role.list.updatedAt"), translate("admin.role.list.description"), translate("admin.role.list.createdBy")],
                        md: [translate("admin.role.list.updatedAt"), translate("admin.role.list.description")],
                        lg: [],
                    }}
                    onSort={handleSortWrapper}
                    sortField={sortField}
                    sortOrder={sortOrder}
                />
            ) : (
                <p className="text-center mt-4">{translate("admin.role.list.noRolesFound")}</p>
            )}

            <RoleFilters
                open={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApplyFilters={handleApplyFilters}
            />

            <Modal
                title={selectedRole ? translate("admin.role.list.editRole") : translate("admin.role.list.createRole")}
                open={showModal}
                onClose={closeModal}
            >
                <RoleForm role={selectedRole} onSave={handleSave} setShowModal={setShowModal} />
            </Modal>
        </div>
    );
};

export default RoleList;
