"use client";

import { LoadingRequest } from "@/app/components/loadingRequest";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface ContactsProps {
    id: string;
    name_user: string;
    email_user: string;
    created_at: string;
}

export default function All_contacts() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<ContactsProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "created_at");
    const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 5);
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [orderDirection, setOrderDirection] = useState("desc");

    useEffect(() => {
        fetchFormContacts();
    }, [currentPage, limit, orderBy, orderDirection]);

    const apiClient = setupAPIClient();

    async function fetchFormContacts() {
        try {
            setLoading(true);
            const response = await apiClient.get(`/contacts_form/all_contacts`, {
                params: {
                    page: currentPage,
                    limit,
                    search,
                    orderBy,
                    orderDirection
                }
            });
            setContacts(response.data.contacts);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    function updateUrlParams() {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", limit.toString());
        if (search) params.set("search", search); // Inclui o termo de busca
        if (orderBy) params.set("orderBy", orderBy);
        params.set("orderDirection", orderDirection);
        router.replace(`?${params.toString()}`);
    }

    useEffect(() => {
        updateUrlParams();
    }, [currentPage, limit, orderBy, orderDirection]);

    function handleSearchSubmit() {
        setCurrentPage(1);
        updateUrlParams(); // Atualiza a URL com os parâmetros
        fetchFormContacts();
    }

    function handleOrderByChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setOrderBy(e.target.value);
        setCurrentPage(1);
    }

    function handleOrderDirectionChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setOrderDirection(e.target.value);
        setCurrentPage(1);
    }

    function handleLimitChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
    }

    function handleSelectContact(id: string) {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(contactId => contactId !== id) : [...prev, id]
        );
    }

    function handleSelectAll() {
        if (selectedContacts.length === contacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.map(contact => contact.id));
        }
    }

    function handleResetFilters() {
        setSearch("");
        setOrderBy("created_at");
        setOrderDirection("desc");
        setLimit(5);
        setCurrentPage(1);
        router.replace(""); // Limpa a URL para valores padrão
        fetchFormContacts();
    }

    async function handleDeleteContacts(contactIds: string[]) {
        setSelectedContacts([]); // Limpa a seleção após deletar
        fetchFormContacts(); // Atualiza a lista de contatos
    }

    


    return (
        <>
            {loading ? (
                <LoadingRequest />
            ) : (
                <SidebarAndHeader>
                    <Section>
                        <TitlePage title="TODOS OS CONTATOS" />

                        {/* Barra de ações */}
                        <div className="mb-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                            <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou e-mail"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border p-2 rounded w-96 text-black"
                                />
                                <button
                                    onClick={handleSearchSubmit}
                                    className="mt-2 md:mt-0 md:ml-2 p-2 bg-backgroundButton text-white rounded w-full md:w-auto"
                                >
                                    Buscar
                                </button>
                                <button
                                    onClick={handleResetFilters}
                                    className="mt-2 md:mt-0 md:ml-2 p-2 bg-gray-500 text-white rounded w-full md:w-auto"
                                >
                                    Resetar
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
                                <select
                                    value={orderBy}
                                    onChange={handleOrderByChange}
                                    className="border p-2 rounded w-full md:w-auto md:mr-2 text-black"
                                >
                                    <option value="created_at">Ordenar por Data</option>
                                    <option value="name_user">Ordenar por Nome</option>
                                    <option value="email_user">Ordenar por Email</option>
                                </select>
                                <select
                                    value={orderDirection}
                                    onChange={handleOrderDirectionChange}
                                    className="border p-2 rounded w-full md:w-auto text-black"
                                >
                                    <option value="asc">Mais antigas</option>
                                    <option value="desc">Mais recentes</option>
                                </select>
                                {selectedContacts.length > 0 && (
                                    <div className="mb-4 flex justify-end">
                                        <button
                                            onClick={() => handleDeleteContacts(selectedContacts)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Deletar {selectedContacts.length} contato(s)
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Tabela de contatos */}
                        <div className="overflow-x-auto">
                            <table className="border rounded min-w-full table-auto">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-center p-3">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                                <span>Todos</span>
                                            </label>
                                        </th>

                                        <th>Nome</th>
                                        <th>Email</th>
                                        <th>Data de Criação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map(contact => (
                                        <tr
                                            key={contact.id}
                                            className="border-b cursor-pointer"
                                        >
                                            <td className="w-2 p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.includes(contact.id)}
                                                    onChange={() => handleSelectContact(contact.id)}
                                                />
                                            </td>
                                            <td
                                                className="text-left"
                                                onClick={() => router.push(`/contacts_form/all_contacts/${contact.id}`)}>{contact.name_user}</td>
                                            <td
                                                className="text-left"
                                                onClick={() => router.push(`/contacts_form/all_contacts/${contact.id}`)}>{contact.email_user}</td>
                                            <td
                                                className="text-left"
                                                onClick={() => router.push(`/contacts_form/all_contacts/${contact.id}`)}>{new Date(contact.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        <div className="mt-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-gray-300 rounded disabled:opacity-50 text-black"
                            >
                                Anterior
                            </button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-gray-300 rounded disabled:opacity-50 text-black"
                            >
                                Próxima
                            </button>
                            <select
                                value={limit}
                                onChange={handleLimitChange}
                                className="border p-2 rounded text-black"
                            >
                                <option value={5}>5 por página</option>
                                <option value={10}>10 por página</option>
                                <option value={20}>20 por página</option>
                            </select>
                        </div>
                    </Section>
                </SidebarAndHeader>
            )}
        </>
    );
}