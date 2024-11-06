import { setupAPIClient } from "@/services/api";
import { useState } from "react";

const BulkUser = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
            setError(null);  // Limpa o erro quando o usuário seleciona um arquivo
            setSuccess(null); // Limpa a mensagem de sucesso
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file) {
            setError("Por favor, selecione um arquivo.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append("file", file); // Adiciona o arquivo ao formData

        try {
            const apiClient = setupAPIClient();

            // Envia o formData com o arquivo para o backend
            const response = await apiClient.post("/user/bulk_users", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Certifica-se de que o tipo de conteúdo é multipart/form-data
                },
            });

            setSuccess("Arquivo carregado com sucesso!");
            console.log("File uploaded successfully:", response.data);
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("Ocorreu um erro ao carregar o arquivo. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md md:max-w-none space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Upload de Arquivo Excel</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:py-3 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-gray-700 file:bg-gray-50 hover:file:bg-gray-100"
                    />
                </div>

                {file && (
                    <div className="bg-gray-100 p-2 rounded-md">
                        <span className="text-sm text-gray-700">Arquivo Selecionado: <strong>{file.name}</strong></span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-md">
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 text-green-700 p-4 rounded-md">
                        <p>{success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-6 py-3 bg-backgroundButton text-white rounded-md hover:bg-hoverButtonBackground transition duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isLoading ? "Carregando..." : "Carregar Arquivo"}
                </button>
            </form>
        </div>
    );
};

export default BulkUser;