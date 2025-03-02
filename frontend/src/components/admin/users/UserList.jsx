import React, { useEffect, useState } from "react";
import { useUser } from "../../../contexts/UserContext";
import Table from "../../shared/Table";
import CellDate from "../../shared/CellDate";
import UserFilters from "./filter/UserFilters";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import UserForm from "./form/UserForm";

const UserList = () => {
    const { loadUsers, updateUserById, registerUser, deleteUserById, isLoading } = useUser();

    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const usersPerPage = 10;
    const [filters, setFilters] = useState({ search: "", startDate: "", endDate: "", role_id: "" });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await loadUsers({ ...filters, page: currentPage, limit: usersPerPage });
                if (response?.users) {
                    setFilteredUsers(response.users);
                    setTotalUsers(response.total);
                }
            } catch (error) {
                console.error("❌ Error al cargar usuarios:", error);
            }
        };
        fetchUsers();
    }, [currentPage, usersPerPage, filters]);

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
            if (userId) {
                await updateUserById(userId, formData);
            } else {
                await registerUser(formData);
            }
            closeModal();
            setCurrentPage(0); // Reiniciar paginación tras guardar
        } catch (error) {
            console.error("❌ Hubo un error al guardar el usuario.");
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`¿Seguro que quieres eliminar a ${user.name}?`)) return;

        try {
            await deleteUserById(user.id);
            setCurrentPage(0);
        } catch (error) {
            console.error("❌ No se pudo eliminar el usuario.");
        }
    };

    return (
        <div className="container mt-4">

            <FilterBar
                onSearch={(term) => setFilters((prev) => ({ ...prev, search: term }))}
                onOpenFilters={() => setShowFiltersModal(true)}
                onCreate={openModal}
            />

            {!isLoading && filteredUsers.length > 0 ? (
                <Table
                    columns={[
                        { label: "ID", field: "id" },
                        { label: "Nombre", field: "name" }, 
                        { label: "Email", field: "email" },
                        { label: "Rol", field: (row) => row.role?.name || "Sin Rol" },
                        { label: "Registrado", field: (row) => <CellDate value={row.createdAt} /> },
                    ]}
                    data={filteredUsers}
                    actions={[
                        { label: "✏️ Editar", type: "warning", handler: openModal },
                        { label: "🗑️ Eliminar", type: "danger", handler: handleDelete },
                    ]}
                    currentPage={currentPage}
                    itemsPerPage={usersPerPage}
                    totalItems={totalUsers}
                    onPageChange={setCurrentPage}
                />
            ) : (
                <p className="text-center mt-4">No se encontraron usuarios.</p>
            )}

            {showFiltersModal && (
                <UserFilters.jsx
                    show={showFiltersModal}
                    onClose={() => setShowFiltersModal(false)}
                    onApplyFilters={setFilters}
                />
            )}
            {showModal && (
                <Modal title={selectedUser ? "Editar Usuario" : "Crear Usuario"} onClose={closeModal}>
                    <UserForm user={selectedUser} onSave={handleSave} />
                </Modal>
            )}
        </div>
    );
};

export default UserList;
