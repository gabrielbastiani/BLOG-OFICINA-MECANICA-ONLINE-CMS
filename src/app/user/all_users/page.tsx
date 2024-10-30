"use client";

import { notFound } from 'next/navigation';
import Modal from 'react-modal';
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import Image from "next/image";
import { MdNotInterested } from "react-icons/md";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { LoadingRequest } from "../../components/loadingRequest";
import { SidebarAndHeader } from "../../components/sidebarAndHeader";
import { Section } from "../../components/section";
import { TitlePage } from "../../components/titlePage";
import { FaTrashAlt } from 'react-icons/fa';
import { ModalDeleteUser } from '@/app/components/popups/ModalDeleteUser';
import { Pagination } from '@/app/components/pagination';
import { ModalPasswordChange } from '@/app/components/popups/ModalPasswordChange';

interface UsersProps {
    name: string;
    id: string;
    slug_name: string;
    image_user: string;
    status: string;
    role: string;
    email: string;
}

const statusOptions = ["Disponivel", "Indisponivel"];
const roleOptions = ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"];

export default function All_users() {

    const { user } = useContext(AuthContext);
    const [isValidPage, setIsValidPage] = useState(true);
    const [users, setUsers] = useState<UsersProps[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Estado para controlar qual campo está sendo editado
    const [editingUser, setEditingUser] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisiblePassword, setModalVisiblePassword] = useState(false);
    const [userId, setUserId] = useState<string>("");

    const filteredUsers = users.filter((item) => item.role !== "SUPER_ADMIN");

    const searchParams = useSearchParams();

    useEffect(() => {
        const page = Number(searchParams.get("page")) || 1;
        setCurrentPage(page);
    }, [searchParams]);

    useEffect(() => {
        const apiClient = setupAPIClient();

        async function fetchUsers() {
            try {
                setLoading(true);
                if (!user) return;
                const response = await apiClient.get(`/user/all_users?page=${currentPage}`);

                setUsers(response.data.users);
                setTotalPages(response.data.totalPages);

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [user, currentPage]);

    // Função para iniciar a edição
    const handleEdit = (id: string, field: string, currentValue: string) => {
        setEditingUser({ id, field });
        setEditedValue(currentValue);
    };

    // Função para salvar o valor editado e atualizar no banco de dados
    const handleSave = async (id: string) => {
        const apiClient = setupAPIClient();
        try {
            setLoading(true);

            const updatedField = editingUser?.field === "status" ? { status: editedValue } : { role: editedValue };

            const data = {
                ...updatedField,
                user_id: id,
            };

            await apiClient.put(`/user/update`, data);

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === id ? { ...user, ...updatedField } : user
                )
            );

            setEditingUser(null);
            toast.success("Dado atualizado com sucesso");
        } catch (error) {
            console.log(error);
            toast.error("Erro ao atualizar o dado!!!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const page = Number(searchParams.get("page")) || 1;
        setCurrentPage(page);

        const validPages = Array.from({ length: totalPages }, (_, i) => i + 1);

        if (!validPages.includes(page)) {
            setIsValidPage(false);
        } else {
            setIsValidPage(true);
        }
    }, [searchParams, totalPages]);

    if (!isValidPage) {
        return notFound();
    }

    function handleUserDeleted(userId: string) {
        setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
    }

    function handleCloseModalDelete() {
        setModalVisible(false);
    }

    async function handleOpenModalDelete(id: string) {
        setModalVisible(true);
        setUserId(id);
    }

    function handleCloseModalPassword() {
        setModalVisiblePassword(false);
    }

    async function handleOpenModalPassword(id: string) {
        setModalVisiblePassword(true);
        setUserId(id);
    }

    Modal.setAppElement('#root');


    return (
        <>
            {loading ? (
                <LoadingRequest />
            ) : (
                <SidebarAndHeader>
                    <Section>
                        <TitlePage title="USUÁRIOS" />

                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((item, index) => (
                                <div
                                    key={index}
                                    className="mb-10 border-gray-300 border-2 p-5 rounded-md md:p-6 lg:p-8"
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            {item.image_user ? (
                                                <Image
                                                    src={`http://localhost:3333/files/${item.image_user}`}
                                                    alt="usuario"
                                                    width={50}
                                                    height={50}
                                                    className="rounded-full mr-3 object-cover"
                                                />
                                            ) : (
                                                <div className="mr-3 w-[50px] h-[50px] rounded-full bg-gray-300 flex items-center justify-center md:w-[40px] md:h-[40px]">
                                                    <MdNotInterested color="black" size={25} />
                                                </div>
                                            )}
                                            <p className="text-sm md:text-base">{item.name}</p>
                                        </div>
                                        <div className="ml-auto mt-3 md:mt-0">
                                            <FaTrashAlt
                                                size={24}
                                                color="red"
                                                className="cursor-pointer hover:scale-110 transition-transform"
                                                onClick={() => handleOpenModalDelete(item.id)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                        <div className="flex flex-col md:flex-row">
                                            <p className="mb-3 md:mb-0 md:mr-5">
                                                Status:{" "}
                                                {editingUser?.id === item.id && editingUser?.field === "status" ? (
                                                    <select
                                                        value={editedValue || item.status}
                                                        onChange={(e) => setEditedValue(e.target.value)}
                                                        onBlur={() => handleSave(item.id)}
                                                        className="appearance-auto text-black border-gray-300 rounded-md p-1"
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span onClick={() => handleEdit(item.id, "status", item.status)} className="cursor-pointer text-backgroundButton hover:underline">
                                                        {item.status}
                                                    </span>
                                                )}
                                            </p>

                                            <p>
                                                Atribuição:{" "}
                                                {editingUser?.id === item.id && editingUser?.field === "role" ? (
                                                    <select
                                                        value={editedValue || item.role}
                                                        onChange={(e) => setEditedValue(e.target.value)}
                                                        onBlur={() => handleSave(item.id)}
                                                        className="appearance-auto text-black border-gray-300 rounded-md p-1"
                                                    >
                                                        {roleOptions.map((role) => (
                                                            <option key={role} value={role}>
                                                                {role === "SUPER_ADMIN"
                                                                    ? "Super administrador"
                                                                    : role === "ADMIN"
                                                                        ? "Administrador"
                                                                        : role === "EMPLOYEE"
                                                                            ? "Empregado"
                                                                            : null}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span onClick={() => handleEdit(item.id, "role", item.role)} className="cursor-pointer text-backgroundButton hover:underline">
                                                        {item.role === "SUPER_ADMIN"
                                                            ? "Super administrador"
                                                            : item.role === "ADMIN"
                                                                ? "Administrador"
                                                                : item.role === "EMPLOYEE"
                                                                    ? "Empregado"
                                                                    : null}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <p className='mb-3 md:mb-0 md:mr-5'>Email: <span className="text-backgroundButton">{item.email}</span></p>
                                    <button
                                        className='p-2 mt-6 bg-red-600 text-white rounded hover:bg-hoverButtonBackground transition duration-300'
                                        onClick={() => handleOpenModalPassword(item.id)}
                                    >
                                        Mudar senha
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">Nenhum usuário encontrado.</p>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />

                    </Section>
                </SidebarAndHeader>
            )}
            {modalVisible && (
                <ModalDeleteUser
                    isOpen={modalVisible}
                    onRequestClose={handleCloseModalDelete}
                    delete_user={userId}
                    onUserDeleted={handleUserDeleted}
                />
            )}
            {modalVisiblePassword && (
                <ModalPasswordChange
                    isOpen={modalVisiblePassword}
                    onRequestClose={handleCloseModalPassword}
                    change_password={userId}
                />
            )}
        </>
    );
}