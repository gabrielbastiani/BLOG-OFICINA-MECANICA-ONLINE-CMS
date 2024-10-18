"use client";

import { useContext, useEffect, useState } from "react";
import { Section } from "../components/section";
import { SidebarAndHeader } from "../components/sidebarAndHeader";
import { TitlePage } from "../components/titlePage";
import { AuthContext } from "@/contexts/AuthContext";
import { LoadingRequest } from "../components/loadingRequest";
import { setupAPIClient } from "@/services/api";
import Image from "next/image";
import { MdNotInterested } from "react-icons/md";
import { toast } from "react-toastify";

interface UsersProps {
    name: string;
    id: string;
    slug_name: string;
    image_user: string;
    status: string;
    role: string;
}

const statusOptions = ["Disponivel", "Indisponivel"];
const roleOptions = ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"];

export default function Users() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState<UsersProps[]>([]);
    const [loading, setLoading] = useState(false);

    // Estado para controlar qual campo está sendo editado
    const [editingUser, setEditingUser] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    const filteredUsers = users.filter((item) => item.role !== "SUPER_ADMIN");

    useEffect(() => {
        const apiClient = setupAPIClient();

        async function fetchUsers() {
            try {
                setLoading(true);

                if (!user) return;

                const response = await apiClient.get(`/user/all_users`);
                setUsers(response.data.all_users);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [user]);

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

            // Defina o campo correto para atualizar
            const updatedField = editingUser?.field === "status" ? { status: editedValue } : { role: editedValue };

            const data = {
                ...updatedField,
                user_id: id
            };

            // Chamada para API para atualizar o usuário
            await apiClient.put(`/user/update`, data);

            // Atualiza o estado local
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === id ? { ...user, ...updatedField } : user
                )
            );

            setEditingUser(null); // Encerra a edição

            toast.success("Dado atualizado com sucesso");

        } catch (error) {
            console.log(error);
            toast.error("Erro ao atualizar o dado!!!");
        } finally {
            setLoading(false);
        }
    };

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
                                <div key={index} className="mb-10 border-gray-300 border-2 p-5 rounded-md">
                                    <div className="flex items-center mb-4">
                                        {item.image_user ? (
                                            <Image
                                                src={`http://localhost:3333/files/${item.image_user}`}
                                                alt="usuario"
                                                width={50}
                                                height={50}
                                                className="rounded-full mr-3"
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div className="mr-3 w-[50px] h-[50px] md:w-[30px] md:h-[30px] rounded-full bg-gray-300 flex items-center justify-center">
                                                <MdNotInterested color="black" size={25} />
                                            </div>
                                        )}
                                        <p>{item.name}</p>
                                    </div>

                                    <div className="flex items-center">
                                        {/* Campo de edição para Status */}
                                        <p className="mr-5">
                                            Status:{" "}
                                            {editingUser?.id === item.id && editingUser?.field === "status" ? (
                                                <select
                                                    value={editedValue || item.status}  // Define o valor atual ou o editado
                                                    onChange={(e) => setEditedValue(e.target.value)} // Atualiza o valor no estado
                                                    onBlur={() => handleSave(item.id)} // Salva ao perder o foco
                                                    className="appearance-auto text-black"  // Certifique-se de que a seta apareça
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span onClick={() => handleEdit(item.id, "status", item.status)} className="cursor-pointer">
                                                    {item.status}
                                                </span>
                                            )}
                                        </p>

                                        {/* Campo de edição para Atribuição */}
                                        <p>
                                            Atribuição:{" "}
                                            {editingUser?.id === item.id && editingUser?.field === "role" ? (
                                                <select
                                                    value={editedValue || item.role}  // Define o valor atual ou o editado
                                                    onChange={(e) => setEditedValue(e.target.value)} // Atualiza o valor no estado
                                                    onBlur={() => handleSave(item.id)} // Salva ao perder o foco
                                                    className="appearance-auto text-black"  // Certifique-se de que a seta apareça
                                                >
                                                    {roleOptions.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span onClick={() => handleEdit(item.id, "role", item.role)} className="cursor-pointer">
                                                    {item.role}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum usuário encontrado.</p>
                        )}
                    </Section>
                </SidebarAndHeader>
            )}
        </>
    );
}