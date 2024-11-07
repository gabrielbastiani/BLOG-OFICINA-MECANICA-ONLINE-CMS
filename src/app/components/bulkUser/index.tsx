import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { useContext, useState } from "react";
import { toast } from "react-toastify";

const BulkUser = () => {

    const { user } = useContext(AuthContext);

    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleDownload = async () => {
        setIsLoading(true);

        try {
            const apiClient = setupAPIClient();
            const response = await apiClient.get(`/user/download_excel?user_id=${user?.id}`, { responseType: "blob" });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "modelo_usuarios.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Arquivo Excel pronto para download!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar o arquivo Excel.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file) {
            toast.error("Por favor, selecione um arquivo.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const apiClient = setupAPIClient();
            await apiClient.post(`/user/bulk_users?user_id=${user?.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Arquivo carregado com sucesso!");

        } catch (error) {
            console.error(error);
            toast.error("Ocorreu um erro ao carregar o arquivo. Tente novamente.");
        } finally {
            setIsLoading(false);
            setFile(null);
        }
    };

    return (
        <div className="w-full max-w-md md:max-w-none space-y-6">

            <h2 className="text-xl font-semibold text-white">Cadastro de usuários em massa</h2>

            <form className="space-y-4">
                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isLoading}
                    className={`px-6 py-3 bg-gray-400 text-white rounded-md hover:bg-hoverButtonBackground transition duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isLoading ? "Gerando..." : "Baixar modelo de arquivo"}
                </button>
            </form>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="cursor-pointer">
                    <input
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:py-3 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-gray-700 file:bg-gray-50 hover:file:bg-gray-100"
                    />
                </div>

                {file && (
                    <div className="bg-gray-100 p-2 rounded-md w-48">
                        <span className="text-sm text-gray-700">Arquivo Selecionado: <strong>{file.name}</strong></span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 bg-backgroundButton text-white rounded-md hover:bg-hoverButtonBackground transition duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isLoading ? "Carregando..." : "Carregar Arquivo"}
                </button>
            </form>

        </div>
    );
};

export default BulkUser;