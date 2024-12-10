"use client";

import Image from "next/image";
import DataTable from "@/app/components/dataTable";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { MdNotInterested } from "react-icons/md";
import { toast } from "react-toastify";
import { z } from "zod";
import { AuthContext } from "@/contexts/AuthContext";
import noImage from '../../../assets/no-image-icon-6.png';

interface PublicationProps {
    title: string;
    id: string;
    image_url: string | null;
    status: string;
    description: string;
    clicks: number;
    redirect_url: string;
    local_site: any;
    publish_at_start: string | number | Date;
    publish_at_end: string | number | Date;
    is_popup: boolean;
    popup_position: any;
    popup_behavior: any;
    popup_conditions: any;
    marketingPublicationView: {
        id: string;
        marketingPublication_id: string;
        local_site: string
        length: number;
    }
    created_at: string | number | Date;
}

const statusOptions = ["Disponivel", "Indisponivel"];

const routes_pages = [
    { page: "Página inicial", value: '/' },
    { page: "Página do post", value: '/postPage' },
];

const popup_behaviors = [
    { behaviors: "Em quanto carrega uma página", value: 'on_load' },
    { behaviors: "Em quanto rola a página", value: 'on_scroll' },
];

const popup_positions = [
    { position: "Parte superior direita", value: 'top-right' },
    { position: "Parte central", value: 'center' },
];

const locals_site = [
    { locals: "Home parte superior", value: 'top_home' },
    { locals: "Página de post", value: 'inside-post' },
];

export default function All_marketing_contents() {

    const { user } = useContext(AuthContext);

    const apiClient = setupAPIClient();

    const [allPublications, setAllPublications] = useState<PublicationProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [editingCategory, setEditingPublication] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showDescriptionPopup, setShowDescriptionPopup] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [currentPublicationId, setCurrentPublicationId] = useState("");

    async function fetchPublications({ page, limit, search, orderBy, orderDirection, startDate, endDate }: any) {
        try {
            const response = await apiClient.get(`/marketing_publication/all_publications`, {
                params: { page, limit, search, orderBy, orderDirection, startDate, endDate }
            });
            setAllPublications(response.data.publications);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSave = async (id: string, field: keyof PublicationProps) => {
        try {
            let updatedField: Partial<PublicationProps> = {};

            if (field === "title") {
                updatedField = { title: editedValue };
            } else if (field === "description") {
                updatedField = { description: editedValue };
            } else if (field === "status") {
                updatedField = { status: editedValue };
            } else if (field === "clicks") {
                updatedField = { clicks: Number(editedValue) };
            }

            const data = { ...updatedField, marketingPublication_id: id };

            await apiClient.put(`/category/update`, data);

            setAllPublications((prevPubl) =>
                prevPubl.map((pub) => (pub.id === id ? { ...pub, ...updatedField } : pub))
            );

            setEditingPublication(null);
            setShowDescriptionPopup(null);
            toast.success("Dado atualizado com sucesso");

        } catch (error) {
            console.log("Erro ao atualizar a publicidade:", error);
            toast.error("Erro ao atualizar o dado!!!");
        }
    };

    const handleEdit = (id: string, field: string, currentValue: string) => {
        setEditingPublication({ id, field });
        setEditedValue(currentValue);
    };

    const handleImageClick = (imageUrl: string, id: string) => {
        setModalImage(imageUrl);
        setCurrentPublicationId(id);
    };

    const handleCloseModal = () => {
        setModalImage(null);
        setImagePreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDescriptionClick = (id: string, description: string) => {
        setShowDescriptionPopup(id);
        setEditedValue(description || "");
    };

    const handleDeleteImage = async () => {
        try {
            await apiClient.put(`/marketing_publication/delete_image?marketingPublication_id=${currentPublicationId}`);
            setAllPublications((prevPubl) =>
                prevPubl.map((pub) => (pub.id === currentPublicationId ? { ...pub, image_url: null } : pub))
            );
            toast.success("Imagem excluída com sucesso");
            handleCloseModal();
        } catch (error) {
            console.error("Erro ao excluir a imagem:", error);
            toast.error("Erro ao excluir a imagem");
        }
    };

    const handleUpdateImage = async () => {
        if (fileInputRef.current && fileInputRef.current.files) {
            const formData = new FormData();
            formData.append("marketingPublication_id", currentPublicationId);
            formData.append("file", fileInputRef.current.files[0]);

            try {
                const response = await apiClient.put(`/marketing_publication/update`, formData);
                const updatePublication = response.data;

                setAllPublications((prevPubl) =>
                    prevPubl.map((pub) => (pub.id === currentPublicationId ? { ...pub, image_url: updatePublication.image_url } : pub))
                );

                toast.success("Imagem atualizada com sucesso");
                handleCloseModal();
            } catch (error) {
                console.error("Erro ao atualizar a imagem:", error);
                toast.error("Erro ao atualizar a imagem");
            }
        }
    };

    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="TODAS PUBLICIDADES" />

                <DataTable
                    active_buttons_searchInput_comments={false}
                    checkbox_delete={true}
                    generate_excel_delete="/marketing_publication/download_excel_delete_marketing?user_id"
                    delete_bulk_data="/marketing_publication/bulk_delete_publications?user_id"
                    modal_delete_bulk={true}
                    active_buttons_searchInput_notification={false}
                    active_export_data={true}
                    name_file_export="Publicações de Marketing"
                    availableColumns={[
                        "id",
                        "title",
                        "description",
                        "status",
                        "redirect_url",
                        "clicks",
                        "publish_at_start",
                        "publish_at_end",
                        "is_popup",
                        "local_site",
                        "popup_position",
                        "popup_behavior",
                        "popup_conditions",
                        "created_at"
                    ]}
                    customNames={{
                        id: "ID da categoria",
                        title: "Nome da categoria",
                        description: "Descrição",
                        status: "Status",
                        redirect_url: "Subcategorias",
                        created_at: "Data de cadastro"
                    }}
                    customNamesOrder={{
                        title: "Nome Completo",
                        created_at: "Data de Registro"
                    }}
                    availableColumnsOrder={["title", "created_at"]}
                    columnsOrder={[
                        { key: "title", label: "Nome" },
                        { key: "created_at", label: "Data de Criação" }
                    ]}
                    table_data="category"
                    url_delete_data="/category/delete_category"
                    data={allPublications}
                    totalPages={totalPages}
                    onFetchData={fetchPublications}
                    columns={[
                        {
                            key: 'image_url',
                            label: 'Imagem',
                            render: (item) => (
                                <>
                                    {item.image_url ? (
                                        <Image
                                            src={`http://localhost:3333/files/${item.image_url}`}
                                            alt={item.title}
                                            width={100}
                                            height={100}
                                            className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                            onClick={() => user?.role === "EMPLOYEE" ? "" : handleImageClick(`http://localhost:3333/files/${item.image_url}`, item.id)} />
                                    ) : (
                                        <div className="mr-3 w-[50px] h-[50px] rounded-full bg-gray-300 flex items-center justify-center md:w-[40px] md:h-[40px]">
                                            <MdNotInterested
                                                className="cursor-pointer"
                                                color="black"
                                                size={25}
                                                onClick={() => user?.role === "EMPLOYEE" ? "" : handleImageClick(`http://localhost:3333/files/${item.image_url}`, item.id)} />
                                        </div>
                                    )}
                                    {modalImage && (
                                        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                                                <button onClick={handleCloseModal} className="absolute top-2 right-2 text-black hover:text-red-600 text-lg">
                                                    X
                                                </button>
                                                <div className="flex justify-center mb-4 w-96 h-96">
                                                    {modalImage === null ?
                                                        <Image
                                                            src={noImage}
                                                            alt="not"
                                                            width={400}
                                                            height={400}
                                                            className="object-cover rounded-md"
                                                            style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                                        :
                                                        <Image
                                                            src={imagePreview || modalImage}
                                                            alt="Imagem da Categoria"
                                                            width={400}
                                                            height={400}
                                                            className="object-cover rounded-md"
                                                            style={{ maxWidth: '100%', maxHeight: '100%' }} />}
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="block w-full text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer p-2 mb-3"
                                                        onChange={handleFileChange} />
                                                    <div className="flex justify-around">
                                                        <button
                                                            onClick={handleUpdateImage}
                                                            className="bg-backgroundButton text-white py-2 px-4 rounded-lg hover:bg-hoverButtonBackground transition-colors"
                                                        >
                                                            Atualizar Imagem
                                                        </button>
                                                        <button
                                                            onClick={handleDeleteImage}
                                                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            Deletar Imagem
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ),
                        },
                        {
                            key: "title",
                            label: "Nome",
                            render: (item) => (
                                <>
                                    {editingCategory?.id === item.id && editingCategory?.field === "title" ? (
                                        <input
                                            type="text"
                                            value={editedValue}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            onBlur={() => handleSave(item.id, "title")}
                                            className="border-gray-300 rounded-md p-1 text-black" />
                                    ) : (
                                        <td
                                            onClick={() => user?.role === "EMPLOYEE" ? "" : handleEdit(item.id, "title", item.title)}
                                            className="cursor-pointer hover:underline text-white truncate max-w-44"
                                        >
                                            {item.title}
                                        </td>
                                    )}
                                </>
                            ),
                        },
                        {
                            key: "description",
                            label: "Descrição",
                            render: (item) => (
                                <td
                                    onClick={() => user?.role === "EMPLOYEE" ? "" : handleDescriptionClick(item.id, item.description || "")}
                                    className="cursor-pointer text-white hover:underline text-xs truncate max-w-32"
                                >
                                    {item.description ? item.description : "Adicionar descrição"}
                                </td>
                            ),
                        },
                        {
                            key: 'clicks',
                            label: 'Ordenação',
                            render: (item) => (
                                <td>
                                    {editingCategory?.id === item.id && editingCategory?.field === "clicks" ? (
                                        <input
                                            type="number"
                                            min={1}
                                            value={editedValue || item.clicks.toString()}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            onBlur={() => handleSave(item.id, "clicks")}
                                            className="border-gray-300 rounded-md p-1 text-black" />
                                    ) : (
                                        <td
                                            onClick={() => user?.role === "EMPLOYEE" ? "" : handleEdit(item.id, "clicks", item.clicks.toString())}
                                            className="cursor-pointer text-black hover:underline bg-slate-200 p-2 w-3 rounded"
                                        >
                                            {item.clicks}
                                        </td>
                                    )}
                                </td>
                            ),
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (item) => (
                                <td>
                                    {editingCategory?.id === item.id && editingCategory?.field === "status" ? (
                                        <select
                                            value={editedValue || item.status}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            onBlur={() => handleSave(item.id, "status")}
                                            className="appearance-auto text-black border-gray-300 rounded-md p-1"
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <td onClick={() => user?.role === "EMPLOYEE" ? "" : handleEdit(item.id, "status", item.status)}
                                            className="cursor-pointer text-red-500 hover:underline">
                                            {item.status}
                                        </td>
                                    )}
                                </td>
                            ),
                        },
                        {
                            key: "created_at",
                            label: "Data de Criação",
                            render: (item) => (
                                <td>{moment(item.created_at).format('DD/MM/YYYY HH:mm')}</td>
                            ),
                        }
                    ]}
                />
                {/* Popup for editing description */}
                {showDescriptionPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg w-80">
                            <h2 className="text-lg font-semibold mb-3 text-black">Editar Descrição</h2>
                            <textarea
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                rows={4}
                                className="w-full border-black rounded-md p-2 text-black"
                            />
                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    onClick={() => setShowDescriptionPopup(null)}
                                    className="px-4 py-2 text-sm font-semibold text-black bg-gray-100 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleSave(showDescriptionPopup, "description")}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-backgroundButton rounded-md"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </Section>
        </SidebarAndHeader>
    )
}