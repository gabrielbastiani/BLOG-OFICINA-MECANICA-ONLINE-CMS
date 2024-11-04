import { useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify";
import { AuthContext } from "@/contexts/AuthContext";
import ConfirmDeleteModal from "./confirmDeleteModal";
import ExportDataModal from "./exportDataModal";
import TimeFilterModal from "./timeFilterModal";

interface DataTableProps<T extends { id: string }> {
    name_file_export: string;
    table_data: string;
    url_item_router: string;
    url_delete_data: string;
    data: T[];
    columns: { key: keyof T; label: string }[];
    totalPages: number;
    onFetchData: (params: { page: number; limit: number; search: string; orderBy: string; orderDirection: string, startDate?: string, endDate?: string }) => void;
}

function DataTable<T extends { created_at: string | number | Date; id: string }>({
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
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

    const [isModalOpenExportData, setIsModalOpenExportData] = useState(false);

    const handleOpenExportData = () => setIsModalOpenExportData(true);
    const handleCloseModalExportData = () => setIsModalOpenExportData(false);

    const [isModalOpenTimeData, setIsModalOpenTimeData] = useState(false);
    const handleOpenTimeData = () => setIsModalOpenTimeData(true);
    const handleCloseModalTimeData = () => setIsModalOpenTimeData(false);

    useEffect(() => {
        const initialSearch = searchParams.get("search") || "";
        const initialOrderBy = searchParams.get("orderBy") || "created_at";
        const initialOrderDirection = searchParams.get("orderDirection") || "desc";
        const initialLimit = Number(searchParams.get("limit")) || 5;
        const initialCurrentPage = Number(searchParams.get("page")) || 1; // Mudança aqui para "page"
        const initialStartDate = searchParams.get("startDate") || "";
        const initialEndDate = searchParams.get("endDate") || "";

        setSearch(initialSearch);
        setOrderBy(initialOrderBy);
        setOrderDirection(initialOrderDirection);
        setLimit(initialLimit);
        setCurrentPage(initialCurrentPage);
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);

    }, [searchParams]);

    const updateUrlParams = () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (orderBy) params.set("orderBy", orderBy);
        if (orderDirection) params.set("orderDirection", orderDirection);
        if (limit) params.set("limit", limit.toString());
        if (currentPage) params.set("page", currentPage.toString());
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        router.replace(`?${params.toString()}`);
    };

    useEffect(() => {
        updateUrlParams();
    }, [search, orderBy, orderDirection, limit, currentPage, startDate, endDate]);

    useEffect(() => {
        onFetchData({ page: currentPage, limit, search, orderBy, orderDirection, startDate, endDate });
    }, [currentPage, limit, orderBy, orderDirection, search, startDate, endDate]);

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
        setStartDate("");
        setEndDate("");
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

    const [format_file, setFormat_file] = useState("xlsx");

    const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFormat = e.target.value;
        setFormat_file(selectedFormat);
    };

    const toggleColumnSelection = (columnKey: string) => {
        setSelectedColumns((prev) => ({
            ...prev,
            [columnKey]: {
                ...prev[columnKey],
                selected: !prev[columnKey].selected,
            },
        }));
    };

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
                columns: columnsKeys,
                format: format_file,
                customColumnNames,
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

    const handleDateChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        setCurrentPage(1);
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
                        onClick={handleResetFilters}
                        className="mt-2 md:mt-0 md:ml-2 p-2 bg-red-500 text-white rounded w-full md:w-auto"
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
                    <button
                        onClick={handleOpenTimeData}
                        className="mt-2 md:mt-0 md:ml-2 p-2 bg-gray-500 text-white rounded w-full md:w-auto"
                    >
                        Por data
                    </button>
                    <TimeFilterModal
                        isOpen={isModalOpenTimeData}
                        onClose={handleCloseModalTimeData}
                        onDateChange={handleDateChange}
                    />
                    {selectdData.length > 0 && (
                        <div className="flex justify-end items-center ml-4">
                            {selectdData.length > 0 && (
                                <button onClick={handleDelete} className="p-2 bg-red-500 text-white rounded">
                                    Deletar {selectdData.length} dado(s)
                                </button>
                            )}
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
                    <ExportDataModal
                        isOpen={isModalOpenExportData}
                        columns={columns.map((column) => ({
                            ...column,
                            key: String(column.key)
                        }))}
                        selectedColumns={selectedColumns}
                        formatFile={format_file}
                        onClose={handleCloseModalExportData}
                        onFormatChange={(format) => handleFormatChange({ target: { value: format } } as React.ChangeEvent<HTMLSelectElement>)}
                        onColumnToggle={(columnKey) => toggleColumnSelection(columnKey)}
                        onExport={handleExportData}
                    />
                    {modalVisibleDelete && (
                        <ConfirmDeleteModal
                            isOpen={modalVisibleDelete}
                            onClose={handleCloseModal}
                            onConfirm={handleDeleteData}
                        />
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