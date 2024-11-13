"use client"

import DataTable from "@/app/components/dataTable";
import Image from "next/image";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { MdNotInterested } from "react-icons/md";

interface CategoryProps {
    name_category: string;
    id: string;
    slug_name_category: string;
    image_category: string | null;
    status: string;
    description: string;
    order: number;
    parentId: string;
    children: string[];
    created_at: string | number | Date;
}

const statusOptions = ["Disponivel", "Indisponivel"];

const schema = z.object({
    order: z.number().min(1, "A ordem deve ser um número positivo."),
});

type FormData = z.infer<typeof schema>;

export default function All_categories() {
    const apiClient = setupAPIClient();

    const [allCategories, setAllCategories] = useState<CategoryProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [editingCategory, setEditingCategory] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [showDescriptionPopup, setShowDescriptionPopup] = useState<string | null>(null);

    const { formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    async function fetchCategories({ page, limit, search, orderBy, orderDirection, startDate, endDate }: any) {
        try {
            const response = await apiClient.get(`/category/cms/all_categories`, {
                params: { page, limit, search, orderBy, orderDirection, startDate, endDate }
            });
            setAllCategories(response.data.categories);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSave = async (id: string) => {
        try {
            let updatedField: Partial<CategoryProps> = {};
    
            if (editingCategory?.field === "name_category") {
                updatedField = { name_category: editedValue };
            } else if (editingCategory?.field === "description") {
                updatedField = { description: editedValue };
            } else if (editingCategory?.field === "status") {
                updatedField = { status: editedValue };
            } else if (editingCategory?.field === "order") {
                updatedField = { order: Number(editedValue) };
            }
    
            const data = { ...updatedField, category_id: id };
    
            // Verifique o que está sendo enviado para o backend
            console.log("Dados enviados para atualização:", data);
    
            await apiClient.put(`/category/update`, data);
    
            // Verifique se o backend retorna alguma confirmação de atualização
            setAllCategories((prevCateg) =>
                prevCateg.map((categ) => (categ.id === id ? { ...categ, ...updatedField } : categ))
            );
    
            setEditingCategory(null);
            setShowDescriptionPopup(null);
            toast.success("Dado atualizado com sucesso");
        } catch (error) {
            console.log("Erro ao atualizar a categoria:", error);
            toast.error("Erro ao atualizar o dado!!!");
        }
    };    

    const handleEdit = (id: string, field: string, currentValue: string) => {
        setEditingCategory({ id, field });
        setEditedValue(currentValue);
    };

    const handleImageClick = (imageUrl: string) => {
        setModalImage(imageUrl);
    };

    const handleCloseModal = () => {
        setModalImage(null);
    };

    const handleDescriptionClick = (id: string, description: string) => {
        setShowDescriptionPopup(id);
        setEditedValue(description);
    };

    return (
        <SidebarAndHeader children={
            <Section>
                <TitlePage title="TODAS AS CATEGORIAS" />

                <DataTable
                    modal_delete_bulk={false}
                    active_buttons_searchInput={false}
                    active_export_data={true}
                    customNames={{
                        id: "ID da categoria",
                        name_category: "Nome da categoria",
                        description: "Descrição",
                        status: "Status",
                        parentId: "Parente da categoria?",
                        created_at: "Data de cadastro"
                    }}
                    name_file_export="Categorias"
                    customNamesOrder={{
                        name_category: "Nome Completo",
                        created_at: "Data de Registro"
                    }}
                    availableColumnsOrder={["name_category", "created_at"]}
                    columnsOrder={[
                        { key: "name_category", label: "Nome" },
                        { key: "created_at", label: "Data de Criação" }
                    ]}
                    availableColumns={["id", "name_category", "description", "status", "parentId", "created_at"]}
                    table_data="category"
                    url_delete_data="/category/delete_category"
                    data={allCategories}
                    totalPages={totalPages}
                    onFetchData={fetchCategories}
                    columns={[
                        {
                            key: 'image_category',
                            label: 'Imagem',
                            render: (item) => (
                                <>
                                    {item.image_category ? (
                                        <Image
                                            src={`http://localhost:3333/files/${item.image_category}`}
                                            alt={item.name_category}
                                            width={100}
                                            height={100}
                                            className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                            onClick={() => handleImageClick(`http://localhost:3333/files/${item.image_category}`)}
                                        />
                                    ) : (
                                        <div className="mr-3 w-[50px] h-[50px] rounded-full bg-gray-300 flex items-center justify-center md:w-[40px] md:h-[40px]">
                                            <MdNotInterested color="black" size={25} />
                                        </div>
                                    )}
                                </>
                            ),
                        },
                        {
                            key: "name_category",
                            label: "Nome",
                            render: (item) => (
                                <>
                                    {editingCategory?.id === item.id && editingCategory?.field === "name_category" ? (
                                        <input
                                            type="text"
                                            value={editedValue}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            onBlur={() => handleSave(item.id)}
                                            className="border-gray-300 rounded-md p-1 text-black"
                                        />
                                    ) : (
                                        <span
                                            onClick={() => handleEdit(item.id, "name_category", item.name_category)}
                                            className="cursor-pointer hover:underline text-white"
                                        >
                                            {item.name_category}
                                        </span>
                                    )}
                                </>
                            ),
                        },
                        {
                            key: "description",
                            label: "Descrição",
                            render: (item) => (
                                <span
                                    onClick={() => handleDescriptionClick(item.id, item.description || "")}
                                    className="cursor-pointe text-white hover:underline"
                                >
                                    {item.description ? item.description : "Adicionar descrição"}
                                </span>
                            ),
                        },
                        {
                            key: 'order',
                            label: 'Ordenação',
                            render: (item) => (
                                <td>
                                    {editingCategory?.id === item.id && editingCategory?.field === "order" ? (
                                        <input
                                            type="number"
                                            min={1}
                                            value={editedValue || item.order.toString()}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            onBlur={() => handleSave(item.id)}
                                            className="border-gray-300 rounded-md p-1 text-black"
                                        />
                                    ) : (
                                        <span
                                            onClick={() => handleEdit(item.id, "order", item.order.toString())}
                                            className="cursor-pointer text-black hover:underline bg-slate-200 p-2 w-3 rounded"
                                        >
                                            {item.order}
                                        </span>
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
                                        <span onClick={() => handleEdit(item.id, "status", item.status)}
                                            className="cursor-pointer text-red-500 hover:underline">
                                            {item.status}
                                        </span>
                                    )}
                                </td>
                            ),
                        },
                        {
                            key: "created_at",
                            label: "Data de Criação",
                            render: (item) => (
                                <span>{moment(item.created_at).format('DD/MM/YYYY HH:mm')}</span>
                            ),
                        }
                    ]}
                />

                {/* Modal for image preview */}
                {modalImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                        <div className="relative">
                            <Image src={modalImage} alt="Category Image" width={500} height={500} className="rounded" />
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-0 right-0 mt-2 mr-2 text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}
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
                                    onClick={() => handleSave(showDescriptionPopup)}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-backgroundButton rounded-md"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Section>
        } />
    );
}