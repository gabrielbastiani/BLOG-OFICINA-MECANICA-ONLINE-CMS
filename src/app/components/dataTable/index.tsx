import { useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AiOutlineClose } from "react-icons/ai";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify";
import { AuthContext } from "@/contexts/AuthContext";

interface DataTableProps<T extends { id: string }> {
    name_file_export: string;
    table_data: string;
    url_item_router: string;
    url_delete_data: string;
    data: T[];
    columns: { key: keyof T; label: string }[];
    totalPages: number;
    onFetchData: (params: { page: number; limit: number; search: string; orderBy: string; orderDirection: string }) => void;
}

function DataTable<T extends { id: string }>({
    name_file_export,
    table_data,
    url_item_router,
    url_delete_data,
    data,
    columns,
    totalPages,
    onFetchData,
}: DataTableProps<T>) {

    const { user } = useContext(AuthContext);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "created_at");
    const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 5);
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [orderDirection, setOrderDirection] = useState("desc");
    const [modalVisibleDelete, setModalVisibleDelete] = useState(false);
    const [selectdData, setSelectdData] = useState<string[]>([]);

    useEffect(() => {
        updateUrlParams();
        onFetchData({ page: currentPage, limit, search, orderBy, orderDirection });
    }, [currentPage, limit, orderBy, orderDirection, search]);


    function updateUrlParams() {
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: limit.toString(),
            search,
            orderBy,
            orderDirection
        });
        router.replace(`?${params.toString()}`);
    }

    useEffect(() => {
        updateUrlParams();
    }, [currentPage, limit, orderBy, orderDirection]);

    function handleSearchSubmit() {
        setCurrentPage(1);
        updateUrlParams();
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

    function handleResetFilters() {
        setSearch("");
        setOrderBy("created_at");
        setOrderDirection("desc");
        setLimit(5);
        setCurrentPage(1);
        router.replace("");
    }

    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getVisiblePages = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    async function handleDelete() {
        if (selectdData.length === 0) {
            alert("Nenhum dado selecionado.");
            return;
        }
        setModalVisibleDelete(true);
    }

    const handleCloseModal = () => {
        setModalVisibleDelete(false);
    };

    async function handleDeleteData() {
        try {
            const apiClient = setupAPIClient();
            await apiClient.delete(`${url_delete_data}`, {
                data: {
                    form_contact_ids: selectdData
                }
            });

            toast.success(`Contato(s) deletados com sucesso`);
            setSelectdData([]);
            onFetchData({ page: currentPage, limit, search, orderBy, orderDirection });

            setModalVisibleDelete(false);

        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops, erro ao deletar o usuário.');
            } else {
                console.error(error);
                toast.error('Erro desconhecido.');
            }
        }
    }

    function handleSelectContact(id: string) {
        setSelectdData((prev) =>
            prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id]
        );
    }

    function handleSelectAll() {
        if (selectdData.length === data.length) {
            setSelectdData([]);
        } else {
            setSelectdData(data.map((contact) => contact.id));
        }
    }

    const isISODateString = (value: string) => {
        const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/;
        return isoDatePattern.test(value);
    };

    const formatDate = (value: string) => {
        return new Date(value).toLocaleDateString();
    };

    const [selectedColumns, setSelectedColumns] = useState<{
        [key: string]: { selected: boolean; customName: string }
    }>(
        columns.reduce((acc, column) => {
            acc[column.key as string] = { selected: false, customName: column.label };
            return acc;
        }, {} as { [key: string]: { selected: boolean; customName: string } })
    );

    const selectedKeys = Object.keys(selectedColumns)
        .filter(key => selectedColumns[key].selected)
        .map(key => ({
            key,
            customName: selectedColumns[key].customName,
        }));

    const [isModalOpenExportData, setIsModalOpenExportData] = useState(false);
    const handleOpenExportData = () => setIsModalOpenExportData(true);
    const handleCloseModalExportData = () => setIsModalOpenExportData(false);
    const [format_file, setFormat_file] = useState("xlsx");

    function handleFormatChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setFormat_file(e.target.value);
    }

    const handleExportData = async () => {
        const apiClient = setupAPIClient();
        const columnsKeys = selectedKeys.map(column => column.key); // Apenas os `key`
        const customColumnNames = selectedKeys.reduce((acc, column) => {
            acc[column.key] = column.customName;
            return acc;
        }, {} as { [key: string]: string });

        try {
            const response = await apiClient.post('/export_data', {
                user_id: user?.id,
                tableName: table_data,
                columns: columnsKeys, // Apenas as chaves (strings)
                format: format_file,
                customColumnNames, // Custom columns se a API requerer esses dados separadamente
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));

            const a = document.createElement('a');
            a.href = url;
            a.download = `${name_file_export}.${format_file}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast.success("Dados exportados com sucesso");

            handleCloseModalExportData();

        } catch (error) {
            console.error(error);
            toast.error("Erro ao exportar os dados");
        }
    };


    return (
        <div>
            <div className="mb-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar"
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
                    <select value={orderBy} onChange={handleOrderByChange} className="border p-2 rounded text-black mr-3">
                        {columns.map((column) => (
                            <option key={String(column.key)} value={String(column.key)}>
                                Ordenar por {column.label}
                            </option>
                        ))}
                    </select>
                    <select value={orderDirection} onChange={handleOrderDirectionChange} className="border p-2 rounded text-black">
                        <option value="asc">Ascendente</option>
                        <option value="desc">Descendente</option>
                    </select>
                    {selectdData.length > 0 && (
                        <div className="flex justify-end items-center ml-4">
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-red-500 text-white rounded"
                            >
                                Deletar {selectdData.length} dado(s)
                            </button>
                        </div>
                    )}
                    <div className="flex justify-end items-center ml-4">
                        <button
                            onClick={handleOpenExportData}
                            className="p-2 bg-buttonAlternative text-white rounded"
                        >
                            Exportar dados
                        </button>
                    </div>
                    {isModalOpenExportData && (
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto relative">
                                <button
                                    onClick={handleCloseModalExportData}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                >
                                    <AiOutlineClose size={24} color="black" />
                                </button>
                                <h2 className="mb-4 text-black">Selecione os dados a serem exportados</h2>
                                <div>
                                    {columns.map((column) => (
                                        <div key={String(column.key)} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedColumns[column.key as string].selected}
                                                onChange={() =>
                                                    setSelectedColumns((prev) => ({
                                                        ...prev,
                                                        [column.key as string]: {
                                                            selected: !prev[column.key as string].selected,
                                                            customName: column.label,
                                                        },
                                                    }))
                                                }
                                            />
                                            <label className="ml-2 text-black">{column.label}</label>
                                        </div>
                                    ))}
                                    <select
                                        value={format_file}
                                        onChange={handleFormatChange}
                                        className="border p-2 rounded text-black"
                                    >
                                        <option value="xlsx">Excel XLSX</option>
                                        <option value="csv">Excel CSV</option>
                                    </select>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleCloseModalExportData}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 mr-2"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleExportData}
                                        className="px-4 py-2 bg-backgroundButton text-black rounded hover:bg-hoverButtonBackground"
                                    >
                                        Exportar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Modal de confirmação de exclusão */}
                    {modalVisibleDelete && (
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto relative">
                                <button
                                    onClick={handleCloseModal}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                >
                                    <AiOutlineClose size={24} color="black" />
                                </button>
                                <h2 className="mb-6 mt-8 text-black">
                                    Você tem certeza que deseja excluir {selectdData.length} contato(s)?
                                </h2>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteData}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            {/* Tabela de contatos */}
            <div className="overflow-x-auto">
                <table className="border rounded min-w-full table-auto">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3 text-left">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectdData.length === data.length}
                                />
                            </th>
                            {columns.map((column) => (
                                <th key={String(column.key)} className="p-3 text-left">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={String(item["id"])} className="border-b cursor-pointer">
                                <td className="w-2 p-3">
                                    <input
                                        type="checkbox"
                                        checked={selectdData.includes(item.id)}
                                        onChange={() => handleSelectContact(item.id)}
                                    />
                                </td>
                                {columns.map((column) => (
                                    <td key={String(column.key)} className="w-2 p-3" onClick={() => router.push(`${url_item_router}/${item.id}`)}>
                                        {
                                            isISODateString(String(item[column.key]))
                                                ? formatDate(String(item[column.key]))
                                                : String(item[column.key])
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Paginação */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex justify-center sm:justify-between w-full sm:w-80 space-x-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-gray-300 rounded disabled:opacity-50 text-black w-full sm:w-auto"
                    >
                        Anterior
                    </button>

                    <div className="flex space-x-1">
                        {getVisiblePages().map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={`p-2 rounded ${page === currentPage ? "bg-backgroundButton text-black" : "bg-gray-200 text-black"} w-full sm:w-auto`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-gray-300 rounded disabled:opacity-50 text-black w-full sm:w-auto"
                    >
                        Próxima
                    </button>
                </div>
                <div className="flex items-center w-full sm:w-auto">
                    <label htmlFor="limit" className="mr-2">Itens por página:</label>
                    <select
                        id="limit"
                        value={limit}
                        onChange={handleLimitChange}
                        className="border p-2 rounded text-black"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default DataTable;