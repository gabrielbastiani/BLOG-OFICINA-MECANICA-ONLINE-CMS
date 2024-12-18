"use client"

import Image from "next/image";
import DataTable from "@/app/components/dataTable";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import moment from "moment";
import { Key, useContext, useState } from "react";
import { MdNotInterested } from "react-icons/md";
import { toast } from "react-toastify";
import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface PublicationProps {
    edit: string;
    title: string;
    id: string;
    image_url: string | null;
    status: string;
    description: string;
    clicks: number;
    redirect_url: string;
    publish_at_start: string | number | Date;
    publish_at_end: string | number | Date;
    is_popup: boolean;
    configurationMarketingOnPublication: {
        map: any;
        length: any;
        id: string;
        configurationMarketingType: any
    }
    marketingPublicationView: {
        id: string;
        marketingPublication_id: string;
        local_site: string
        length: number;
    }
    created_at: string | number | Date;
}

const statusOptions = ["Disponivel", "Indisponivel"];

export default function All_marketing_contents() {

    const { user } = useContext(AuthContext);
    const router = useRouter();

    const apiClient = setupAPIClient();

    const [allPublications, setAllPublications] = useState<PublicationProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [editingPublication, setEditingPublication] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [showDescriptionPopup, setShowDescriptionPopup] = useState<string | null>(null);

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

            if (field === "status") {
                updatedField = { status: editedValue };
            } else if (field === "redirect_url") {
                updatedField = { redirect_url: editedValue }
            }

            const data = { ...updatedField, marketingPublication_id: id };

            await apiClient.put(`/marketing_publication/update`, data);

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

    const handleImageClick = (imageUrl: string) => {
        setModalImage(imageUrl);
    };

    const handleCloseModal = () => {
        setModalImage(null);
    };

    const handleDescriptionClick = (description: string) => {
        setShowDescriptionPopup(description);
    };

    
    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="TODAS PUBLICIDADES" />

                <DataTable
                    timeFilterButton={true}
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
                        id: "ID da publicidade",
                        title: "Nome da publicidade",
                        description: "Descrição",
                        status: "Status",
                        redirect_url: "Link de redirecionamento",
                        created_at: "Data de cadastro",
                        clicks: "Clicks na publicidade",
                        publish_at_start: "Inicio data programação",
                        publish_at_end: "Data fim da programação",
                        is_popup: "Publicação é um popup?",
                        local_site: "Locais no site",
                        popup_position: "Posição do popup",
                        popup_behavior: "Comportamento do popup",
                        popup_conditions: "Condições do popup"
                    }}
                    customNamesOrder={{
                        title: "Nome da publicidade",
                        created_at: "Data de Registro",
                        status: "Status",
                        publish_at_start: "Data de inicio da publicidade",
                        publish_at_end: "Data fim da publicidade",
                        is_popup: "Popup?"
                    }}
                    availableColumnsOrder={[
                        "title",
                        "created_at",
                        "status",
                        "publish_at_start",
                        "publish_at_end",
                        "is_popup"
                    ]}
                    columnsOrder={[
                        { key: "title", label: "Nome da publicidade" },
                        { key: "status", label: "Status" },
                        { key: "publish_at_start", label: "Data de inicio da publicidade" },
                        { key: "publish_at_end", label: "Data fim da publicidade" },
                        { key: "is_popup", label: "Popup?" },
                        { key: "created_at", label: "Data de Criação" }
                    ]}
                    table_data="marketingPublication"
                    url_delete_data="/marketing_publication/delete_publications"
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
                                        <>
                                            <Image
                                                src={`http://localhost:3333/files/${item.image_url}`}
                                                alt={item.title}
                                                width={100}
                                                height={100}
                                                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                                onClick={() => handleImageClick(`http://localhost:3333/files/${item.image_url}`)}
                                            />
                                            {modalImage && (
                                                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                                                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                                                        <button onClick={handleCloseModal} className="absolute top-2 right-2 text-black hover:text-red-600 text-lg">
                                                            X
                                                        </button>
                                                        <div className="flex justify-center mb-4 w-96 h-96">
                                                            <Image
                                                                src={modalImage}
                                                                alt="Imagem da Categoria"
                                                                width={400}
                                                                height={400}
                                                                className="object-cover rounded-md"
                                                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) :
                                        <div className="mr-3 w-[50px] h-[50px] rounded-full bg-gray-300 flex items-center justify-center md:w-[40px] md:h-[40px]">
                                            <MdNotInterested color="black" size={25} />
                                        </div>
                                    }

                                </>
                            ),
                        },
                        {
                            key: "title",
                            label: "Nome"
                        },
                        {
                            key: "description",
                            label: "Descrição",
                            render: (item) => (
                                <td
                                    onClick={() => user?.role === "EMPLOYEE" ? "" : handleDescriptionClick(item.description || "")}
                                    className="cursor-pointer text-white hover:underline text-xs truncate max-w-32"
                                >
                                    {item.description ? item.description : "Adicionar descrição"}
                                </td>
                            ),
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (item) => (
                                <td>
                                    {editingPublication?.id === item.id && editingPublication?.field === "status" ? (
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
                            key: "is_popup",
                            label: "É um popup?",
                            render: (item) => (
                                <td>{item.is_popup ? "SIM" : "NÃO"}</td>
                            ),
                        },
                        {
                            key: 'redirect_url',
                            label: 'Link de redirecionamento',
                            render: (item) => (
                                <td>
                                    {editingPublication?.id === item.id && editingPublication?.field === "redirect_url" ? (
                                        <input
                                            type="text"
                                            value={editedValue}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            onBlur={() => handleSave(item.id, "redirect_url")}
                                            className="border-gray-300 rounded-md p-1 text-black" />
                                    ) : (
                                        <td onClick={() => user?.role === "EMPLOYEE" ? "" : handleEdit(item.id, "redirect_url", item.redirect_url)}
                                            className="cursor-pointer text-red-500 hover:underline">
                                            {item.redirect_url}
                                        </td>
                                    )}
                                </td>
                            ),
                        },
                        {
                            key: 'publish_at_start',
                            label: 'Começo da publicidade',
                            render: (item) => (
                                <td>
                                    {item?.publish_at_start && moment(item.publish_at_start).isValid()
                                        ? moment(item.publish_at_start).format('DD/MM/YYYY HH:mm')
                                        : "Sem programação"}
                                </td>
                            ),
                        },
                        {
                            key: 'publish_at_end',
                            label: 'Fim da publicidade',
                            render: (item) => (
                                <td>
                                    {item?.publish_at_end && moment(item.publish_at_end).isValid()
                                        ? moment(item.publish_at_end).format('DD/MM/YYYY HH:mm')
                                        : "Sem programação"}
                                </td>
                            ),
                        },
                        {
                            key: "clicks",
                            label: "Clicks"
                        },
                        {
                            key: "configurationMarketingOnPublication",
                            label: "Configurações",
                            render: (item) => (
                                <td className="flex flex-wrap space-x-2 max-w-xs">
                                    {item.configurationMarketingOnPublication?.length ? (
                                        item.configurationMarketingOnPublication.map((item: any, index: Key | null | undefined) => (
                                            <span
                                                key={index}
                                                className="p-1 bg-gray-200 rounded-full text-xs whitespace-nowrap text-black"
                                            >
                                                {item.configurationMarketingType?.name || "Sem configurações"}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">Sem configurações</span>
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
                        },
                        {
                            key: 'edit',
                            label: 'Editar',
                            render: (item) => (
                                <button
                                    className='p-1 bg-red-600 text-white text-xs rounded hover:bg-hoverButtonBackground transition duration-300'
                                    onClick={() => router.push(`/marketing_contents/all_marketing_contents/marketing_content/${item.id}`)}
                                >
                                    Editar
                                </button>
                            ),
                        },
                    ]}
                />
                {showDescriptionPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg w-96">
                            <h2 className="text-lg font-semibold mb-3 text-black">Ver descrição:</h2>
                            <p
                                className="text-black"
                            >
                                {showDescriptionPopup}
                            </p>
                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    onClick={() => setShowDescriptionPopup(null)}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md"
                                >
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Section>
        </SidebarAndHeader>
    )
}