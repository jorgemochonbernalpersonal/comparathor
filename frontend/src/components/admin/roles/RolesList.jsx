import React, { useEffect, useState } from "react";
import { useRole } from "../../../contexts/RoleContext";
import Table from "../../shared/Table";
import FilterBar from "../../shared/FilterBar";
import Modal from "../../shared/Modal";
import RoleForm from "./RoleForm";

const RoleList = () => {
    const { loadRoles, updateRoleById, addRole, deleteRoleById, isLoading } = useRole();

    const [selectedRole, setSelectedRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [filters, setFilters] = useState({ roleName: "" });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await loadRoles(filters);
                if (response?.roles) {
                    setFilteredRoles(response.roles);
                }
            } catch (error) {
                console.error("❌ Error al cargar roles:", error);
            }
        };
        fetchRoles();
    }, [filters, loadRoles]);

    const openModal = (role = null) => {
        setSelectedRole(role);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedRole(null);
        setShowModal(false);
    };

    const handleSave = async (formData, roleId) => {
        try {
            if (roleId) {
                await updateRoleById(roleId, formData);
            } else {
                await addRole(formData);
            }
            closeModal();
        } catch (error) {
            console.error("❌ Error al guardar el rol:", error);
        }
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el rol ${role.name}?`)) return;

        try {
            await deleteRoleById(role.id);
        } catch (error) {
            console.error("❌ Error al eliminar el rol:", error);
        }
    };

    return (
        <div className="container mt-4">
            <FilterBar
                onSearch={(term) => setFilters((prev) => ({ ...prev, roleName: term }))}
                onCreate={openModal}
            />

            {!isLoading && filteredRoles.length > 0 ? (
                <Table
                    columns={[
                        { label: "ID", field: "id" },
                        { label: "Nombre del Rol", field: "name" },
                        { label: "Descripción", field: "description" },
                    ]}
                    data={filteredRoles}
                    actions={[
                        { label: "✏️ Editar", type: "warning", handler: openModal },
                        { label: "🗑️ Eliminar", type: "danger", handler: handleDelete },
                    ]}
                />
            ) : (
                <p className="text-center mt-4">No se encontraron roles.</p>
            )}

            {showModal && (
                <Modal title={selectedRole ? "Editar Rol" : "Crear Rol"} onClose={closeModal}>
                    <RoleForm role={selectedRole} onSave={handleSave} />
                </Modal>
            )}
        </div>
    );
};

export default RoleList;
