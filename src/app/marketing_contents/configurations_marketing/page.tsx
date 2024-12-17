"use client"

import DataTable from "@/app/components/dataTable";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Key, useState } from "react";
import { toast } from "react-toastify";

interface ConfigurationMarketingConfig {
    id: string;
    value: string;
    description_value: string;
}

interface ConfigurationsProps {
    id: string;
    name: string;
    description: string;
    created_at: string | number | Date;
    value: string;
    description_value: string;
    configurationMarketingConfiguration: ConfigurationMarketingConfig[];
}

export default function Configurations_marketing() {

    const apiClient = setupAPIClient();
    const router = useRouter();

    const [all_configurations, setAll_configurations] = useState<ConfigurationsProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [editName, setEditName] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");
    const [showDescriptionPopup, setShowDescriptionPopup] = useState<string | null>(null);
    const [showDescriptionValuePopup, setShowDescriptionValuePopup] = useState<string | null>(null);

    console.log(all_configurations);

    async function fetchPublications({ page, limit, search, orderBy, orderDirection, startDate, endDate }: any) {
        try {
            const response = await apiClient.get(`/all_marketing_configurations/type`, {
                params: { page, limit, search, orderBy, orderDirection, startDate, endDate }
            });
            setAll_configurations(response.data.configurations || []);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSave = async (id: string, field: keyof ConfigurationsProps) => {
        try {
            let updatedField: Partial<ConfigurationsProps> = {};

            if (field === "name") {
                updatedField = { name: editedValue };
            } else if (field === "description") {
                updatedField = { description: editedValue }
            } else if (field === "value") {
                updatedField = { value: editedValue }
            } else if (field === "description_value") {
                updatedField = { description_value: editedValue }
            }

            const data = { ...updatedField, configurationMarketingType_id: id, configurationMarketingConfiguration_id: id };

            await apiClient.put(`/marketing_configurations/update/type`, data);

            setAll_configurations((prevPubl) =>
                prevPubl.map((pub) => (pub.id === id ? { ...pub, ...updatedField } : pub))
            );

            setEditName(null)
            setShowDescriptionPopup(null);
            toast.success("Dado atualizado com sucesso");

        } catch (error) {
            console.log("Erro ao atualizar a configuração:", error);
            toast.error("Erro ao atualizar o dado!!!");
        }
    };

    const handleDescriptionClick = (id: string, description?: string) => {
        setShowDescriptionPopup(id);
        setEditedValue(description || "");
    };

    const handleDescriptionValueClick = (id: string, description_value?: string) => {
        setShowDescriptionValuePopup(id);
        setEditedValue(description_value || "");
    };

    const handleEdit = (id: string, field: string, currentValue: string) => {
        setEditName({ id, field });
        setEditedValue(currentValue);
    };


    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="TODAS CONFIGURAÇÕES" />

                <div>
                    <button
                        className='mb-4 p-3 bg-red-600 text-white text-sm rounded hover:bg-hoverButtonBackground transition duration-300'
                        onClick={() => router.push(`/marketing_contents/configurations_marketing/add_configuration`)}
                    >
                        Cadastrar configuração
                    </button>
                </div>

                <DataTable
                    timeFilterButton={false}
                    active_buttons_searchInput_comments={false}
                    checkbox_delete={true}
                    generate_excel_delete=""
                    delete_bulk_data=""
                    modal_delete_bulk={false}
                    active_buttons_searchInput_notification={false}
                    active_export_data={false}
                    name_file_export="Configurações de Marketing"
                    availableColumns={[
                        "id",
                        "name",
                        "description",
                        "created_at"
                    ]}
                    customNames={{
                        id: "ID da publicidade",
                        name: "Nome da publicidade",
                        description: "Descrição",
                        created_at: "Data de cadastro"
                    }}
                    customNamesOrder={{
                        name: "Nome da publicidade",
                        created_at: "Data de Registro"
                    }}
                    availableColumnsOrder={[
                        "name",
                        "created_at"
                    ]}
                    columnsOrder={[
                        { key: "name", label: "Nome da publicidade" },
                        { key: "description", label: "Descrição" },
                        { key: "created_at", label: "Data de Criação" }
                    ]}
                    table_data="configurationMarketingType"
                    url_delete_data="/marketing_configurations/delete/type"
                    data={all_configurations}
                    totalPages={totalPages}
                    onFetchData={fetchPublications}
                    columns={[
                        {
                            key: "name",
                            label: "Nome",
                            render: (item) => (
                                <>
                                    {editName?.id === item.id && editName?.field === "name" ? (
                                        <input
                                            type="text"
                                            value={editedValue}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            onBlur={() => handleSave(item.id, "name")}
                                            className="border-gray-300 rounded-md p-1 text-black" />
                                    ) : (
                                        <td
                                            onClick={() => handleEdit(item.id, "name", item.name)}
                                            className="cursor-pointer hover:underline text-white truncate max-w-44"
                                        >
                                            {item.name}
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
                                    onClick={() => handleDescriptionClick(item.id, item.description || "")}
                                    className="cursor-pointer text-white hover:underline text-xs truncate max-w-32"
                                >
                                    {item.description ? item.description : "Adicionar descrição"}
                                </td>
                            ),
                        },
                        {
                            key: "value",
                            label: "Valor",
                            render: (item: ConfigurationsProps) => (
                                <td className="flex flex-wrap space-x-2 max-w-xs">
                                    {item.configurationMarketingConfiguration.map((val: any, index: Key | null | undefined) => (
                                        <div key={index}>
                                            {editName?.id === val.id && editName?.field === "value" ? (
                                                <input
                                                    type="text"
                                                    value={editedValue}
                                                    onChange={(e) => setEditedValue(e.target.value)}
                                                    onBlur={() => handleSave(val.id, "value")}
                                                    className="border-gray-300 rounded-md p-1 text-black"
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => handleEdit(val.id, "value", val.value)}
                                                    className="cursor-pointer hover:underline text-white truncate max-w-44"
                                                >
                                                    {val.value}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </td>
                            ),
                        },
                        {
                            key: "description_value",
                            label: "Descrição do valor",
                            render: (item: ConfigurationsProps) => (
                                <td className="flex flex-wrap space-x-2 max-w-xs">
                                    {item.configurationMarketingConfiguration.map((des: any, index: Key | null | undefined) => (
                                        <div key={index}>
                                            <td
                                                onClick={() => handleDescriptionValueClick(des.id, des.description_value || "")}
                                                className="cursor-pointer text-white hover:underline text-xs truncate max-w-32"
                                            >
                                                {des.description_value ? des.description_value : "Adicionar descrição"}
                                            </td>
                                        </div>
                                    ))}
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
                    ]}
                />
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
                {showDescriptionValuePopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg w-80">
                            <h2 className="text-lg font-semibold mb-3 text-black">Editar descrição do valor</h2>
                            <textarea
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                rows={4}
                                className="w-full border-black rounded-md p-2 text-black"
                            />
                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    onClick={() => setShowDescriptionValuePopup(null)}
                                    className="px-4 py-2 text-sm font-semibold text-black bg-gray-100 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleSave(showDescriptionValuePopup, "description_value")}
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