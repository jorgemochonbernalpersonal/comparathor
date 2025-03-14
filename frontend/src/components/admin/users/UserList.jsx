import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { translate } from "../../../utils/Translate";
import { useUser } from "../../../hooks/UseUser";
import { useRole } from "../../../hooks/UseRole";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import UserFilters from "./filter/UserFilters";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import UserForm from "./form/UserForm";
import LoadingSpinner from "../../shared/LoadingSpinner";

const UserList = () => {
    const usersPerPage = 10;
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const filters = useMemo(() => ({
        search: searchParams.get("search") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        role_id: searchParams.get("roleId") || "",
        page: parseInt(searchParams.get("page") || "1", 10),
        size: parseInt(searchParams.get("size") || usersPerPage.toString(), 10),
        sortField: searchParams.get("sortField") || "id",
        sortOrder: searchParams.get("sortOrder") || "asc",
    }), [searchParams]);

    const { users, totalUsers, isLoading, createUser, updateUser, deleteUser, refetchUsers, handleSort, sortField, sortOrder, handlePageChange, currentPage } = useUser(filters);
    const { roles } = useRole();

    useEffect(() => {
        refetchUsers(filters);
    }, [filters, refetchUsers]);

    const openModal = (user = null) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setShowModal(false);
    };

    const handleSave = async (formData, userId) => {
        try {
            let response = userId
                ? await updateUser({ id: userId, userData: formData })
                : await createUser(formData);

            closeModal();
            refetchUsers();
            return response;
        } catch (error) {
            console.error("❌ Error al guardar usuario:", error);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(translate("admin.user.list.confirmDelete", { name: user.name }))) return;
        try {
            await deleteUser(user.id);
            setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), page: "1" }));
        } catch (error) {
            console.error("❌ Error al eliminar usuario:", error);
        }
    };

    const handleSortWrapper = (field) => {
        const newOrder = filters.sortField === field && filters.sortOrder === "asc" ? "desc" : "asc";
        setSearchParams(prevParams => ({
            ...Object.fromEntries(prevParams.entries()),
            sortField: field,
            sortOrder: newOrder,
            page: "1",
        }));

        handleSort(field);
    };

    const handleApplyFilters = (newFilters) => {
        setSearchParams({
            search: newFilters.search || "",
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
            roleId: newFilters.role_id || "",
            page: "1",
            size: usersPerPage.toString(),
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
        });
        setShowFiltersModal(false);
    };

    const handleClearFilters = () => {
        setSearchParams({ page: "1", size: usersPerPage.toString(), sortField: "id", sortOrder: "asc" });
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setSearchParams({ ...filters, search: term })}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={() => openModal()}
            />

            <div className="mb-3">
                {filters.search && <span className="badge bg-info me-2">🔍 {filters.search}</span>}
                {filters.startDate && <span className="badge bg-warning me-2">📅 {filters.startDate}</span>}
                {filters.endDate && <span className="badge bg-warning me-2">📅 {filters.endDate}</span>}
                {filters.role_id && <span className="badge bg-primary me-2">🛠 {roles.find(r => r.id.toString() === filters.role_id)?.name || "Rol desconocido"}</span>}
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <LoadingSpinner/>
                </div>
            ) : users.length > 0 ? (
                <Table
                    title={translate("admin.user.list.userList")}
                    columns={[
                        { label: translate("admin.user.list.id"), field: "id" },
                        { label: translate("admin.user.list.name"), field: "name" },
                        { label: translate("admin.user.list.email"), field: "email" },
                        {
                            label: translate("admin.user.list.role"),
                            field: "roleName",
                            render: (row) => row.role?.name || translate("admin.user.list.noRole"),
                        },
                        {
                            label: translate("admin.user.list.registered"),
                            field: "createdAt",
                            render: (row) => <CellDate value={row.createdAt} />,
                        },
                    ]}
                    data={users.map(user => ({
                        ...user,
                        roleName: user.role?.name || translate("admin.user.list.noRole"),
                    }))}
                    actions={[
                        { label: `✏️ ${translate("admin.user.list.edit")}`, type: "primary", handler: openModal },
                        { label: `🗑️ ${translate("admin.user.list.delete")}`, type: "danger", handler: handleDelete },
                    ]}
                    hiddenColumnsBreakpoints={{
                        xs: [translate("admin.user.list.email"), translate("admin.user.list.registered"), translate("admin.user.list.name")],
                        sm: [translate("admin.user.list.email"), translate("admin.user.list.registered")],
                        md: [translate("admin.user.list.email")],
                        lg: []
                    }}
                    onSort={handleSortWrapper}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={Math.ceil(totalUsers / filters.size)}
                />

            ) : (
                <p className="text-center mt-4">{translate("admin.user.list.noUsersFound")}</p>
            )}

            <UserFilters
                open={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleClearFilters}
                roles={roles}
            />

            <Modal
                title={selectedUser ? translate("admin.user.list.editUser") : translate("admin.user.list.createUser")}
                open={showModal}
                onClose={closeModal}
            >
                <UserForm user={selectedUser} onSave={handleSave} setShowModal={setShowModal} />
            </Modal>
        </div>
    );
};

export default UserList;
