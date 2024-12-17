"use client";

import { Input } from "@/app/components/input";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schemaType = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    description: z.string().optional(),
});

const schemaConfiguration = z.object({
    value: z.string().nonempty("O campo valor é obrigatório"),
    description_value: z.string().optional(),
});

type FormTypeData = z.infer<typeof schemaType>;
type FormConfigurationData = z.infer<typeof schemaConfiguration>;

export default function AddConfiguration() {

    const [currentTab, setCurrentTab] = useState<"type" | "configuration">("type");
    const [dataConfigurationType, setDataConfigurationType] = useState<any>(null);

    const {
        register: registerType,
        handleSubmit: handleSubmitType,
        formState: { errors: errorsType },
        reset: resetType,
    } = useForm<FormTypeData>({
        resolver: zodResolver(schemaType),
        mode: "onChange",
    });

    const {
        register: registerConfiguration,
        handleSubmit: handleSubmitConfiguration,
        formState: { errors: errorsConfiguration },
        reset: resetConfiguration,
    } = useForm<FormConfigurationData>({
        resolver: zodResolver(schemaConfiguration),
        mode: "onChange",
    });

    async function onSubmitType(data: FormTypeData) {
        try {
            const apiClient = setupAPIClient();
            const response = await apiClient.post("/marketing_configurations/create/type", {
                name: data?.name,
                description: data?.description,
            });
            setDataConfigurationType(response.data);
            toast.success("Tipo cadastrado com sucesso!");
            resetType();
            setCurrentTab("configuration");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao cadastrar tipo.");
        }
    }

    async function onSubmitConfiguration(data: FormConfigurationData) {
        try {
            const apiClient = setupAPIClient();
            await apiClient.post("/marketing_configurations/configuration", {
                ...data,
                configurationMarketingType_id: dataConfigurationType?.id,
            });
            toast.success("Configuração cadastrada com sucesso!");
            resetConfiguration();
            setCurrentTab("type");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao cadastrar configuração.");
        }
    }

    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="ADICIONAR CONFIGURAÇÃO" />

                {/* Abas de navegação */}
                <div className="flex space-x-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded ${currentTab === "type" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}
                        onClick={() => setCurrentTab("type")}
                    >
                        Tipo
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${currentTab === "configuration" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}
                        onClick={() => setCurrentTab("configuration")}
                        disabled={!dataConfigurationType}
                    >
                        Configuração
                    </button>
                </div>

                {/* Conteúdo das abas */}
                {currentTab === "type" && (
                    <div className="flex flex-col space-y-6 w-full max-w-md md:max-w-none">
                        <Input
                            styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                            type="text"
                            placeholder="Digite um nome..."
                            name="name"
                            error={errorsType.name?.message}
                            register={registerType}
                        />
                        <div>
                            <textarea
                                {...registerType("description")}
                                className="border-2 rounded-md h-56 p-3 w-96 resize-none text-black"
                                placeholder="Digite uma descrição..."
                            />
                            {errorsType.description && <p className="text-red-500 text-xs">{errorsType.description.message}</p>}
                        </div>
                        <button
                            onClick={handleSubmitType(onSubmitType)}
                            className="w-full md:w-80 px-6 py-3 bg-backgroundButton text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                        >
                            Cadastrar Tipo
                        </button>
                    </div>
                )}

                {currentTab === "configuration" && (
                    <div className="flex flex-col space-y-6 w-full max-w-md md:max-w-none">
                        <h2 className="text-lg font-bold">Adicionar Configuração</h2>
                        <Input
                            styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                            type="text"
                            placeholder="Valor"
                            name="value"
                            error={errorsConfiguration.value?.message}
                            register={registerConfiguration}
                        />
                        <div>
                            <textarea
                                {...registerConfiguration("description_value")}
                                className="border-2 rounded-md h-56 p-3 w-96 resize-none text-black"
                                placeholder="Digite uma descrição..."
                            />
                            {errorsConfiguration.description_value && <p className="text-red-500 text-xs">{errorsConfiguration.description_value.message}</p>}
                        </div>
                        <button
                            onClick={handleSubmitConfiguration(onSubmitConfiguration)}
                            className="w-full md:w-80 px-6 py-3 bg-backgroundButton text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                        >
                            Cadastrar Configuração
                        </button>
                    </div>
                )}
            </Section>
        </SidebarAndHeader>
    );
}