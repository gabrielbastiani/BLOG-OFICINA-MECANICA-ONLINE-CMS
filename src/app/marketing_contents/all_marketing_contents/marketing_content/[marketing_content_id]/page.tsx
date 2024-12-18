"use client";

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import Image from "next/image";
import Select from "react-select";

interface FormDataProps {
    title: string;
    id: string;
    image_url: string | null;
    status: string;
    description: string;
    redirect_url: string;
    publish_at_start: string | number | Date;
    publish_at_end: string | number | Date;
    is_popup: boolean;
    created_at: string | number | Date;
    configurationMarketingOnPublication?: {
        configurationMarketingType: {
            id: string;
            name: string;
        };
    }[];
}

interface ConfigurationMarketingTypeProps {
    id: string;
    name: string;
}

const schema = z.object({
    title: z.string().nonempty("O título é obrigatório"),
    image_url: z.string().optional(),
    redirect_url: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["Disponivel", "Indisponivel"], {
        errorMap: () => ({ message: "Selecione um status válido" }),
    }),
    publish_at_start: z.string().optional(),
    publish_at_end: z.string().optional(),
    configurationMarketingOnPublication: z.array(z.string()).optional()
});

type FormData = z.infer<typeof schema>;

export default function Marketing_content({ params }: { params: { marketing_content_id: string } }) {

    const [marketingPublicationData, setMarketingPublicationData] = useState<FormDataProps | null>(null);
    const [configurationMarketingOnPublication, setConfigurationMarketingOnPublication] = useState<ConfigurationMarketingTypeProps[]>([]);
    const [selectedConfigsMarketing, setSelectedConfigsMarketing] = useState<string[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [imageMarketing, setImagePost] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const apiClient = setupAPIClient();
                const [publicationResponse, configsResponse] = await Promise.all([
                    apiClient.get(`/marketing_publication/all_publications?marketing_content_id=${params.marketing_content_id}`),
                    apiClient.get(`/marketing_configurations/configuration/all_configs`)
                ]);

                const marketingData = publicationResponse.data.unique_marketing_content;
                setMarketingPublicationData(marketingData);

                setSelectedConfigsMarketing(
                    marketingData.configurationMarketingOnPublication?.map((item: { configurationMarketingType: { id: any } }) => item.configurationMarketingType.id) || []
                );

                setConfigurationMarketingOnPublication(configsResponse.data);

                setAvatarUrl(marketingData.image_url || null);

                reset({
                    title: marketingData.title,
                    redirect_url: marketingData.redirect_url,
                    status: marketingData.status,
                    publish_at_start: marketingData.publish_at_start
                        ? new Date(marketingData.publish_at_start).toISOString().slice(0, 16)
                        : "",
                    publish_at_end: marketingData.publish_at_end
                        ? new Date(marketingData.publish_at_end).toISOString().slice(0, 16)
                        : "",
                });

            } catch (error) {
                toast.error("Erro ao carregar os dados do marketing.");
            }
        }

        fetchData();
    }, [params.marketing_content_id, reset]);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setImagePost(image);
            setAvatarUrl(URL.createObjectURL(image));
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {

            const formData = new FormData();
            formData.append("marketingPublication_id", params.marketing_content_id);
            formData.append("title", data.title || "");
            formData.append("description", data.description || "");
            formData.append("redirect_url", data.redirect_url || "");
            formData.append("status", data.status || "");
            formData.append("publish_at_start", data.publish_at_start ? new Date(data.publish_at_start).toISOString() : "");
            formData.append("publish_at_end", data.publish_at_end ? new Date(data.publish_at_end).toISOString() : "");
            formData.append("configurationMarketingOnPublication", JSON.stringify(selectedConfigsMarketing));

            if (imageMarketing) {
                formData.append("file", imageMarketing);
            }

            const apiClient = setupAPIClient();
            await apiClient.put("/marketing_publication/update", formData);

            toast.success("Marketing atualizado com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar o marketing.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <SidebarAndHeader>
            <Section>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <label>
                        Titulo:
                        <input
                            type="text"
                            placeholder="Digite um título..."
                            {...register("title")}
                            className="w-full border-2 rounded-md px-3 py-2 text-black"
                        />
                    </label>

                    <div className="mt-5">
                        <label>É em popup: {marketingPublicationData?.is_popup ? <b className="text-red-500">SIM</b> : <b className="text-red-500">NÃO</b>}</label>
                    </div>

                    <label className="relative w-full h-[450px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                        <input type="file" accept="image/png, image/jpeg" onChange={handleFile} className="hidden" />
                        {avatarUrl ? (
                            <Image
                                src={imageMarketing ? avatarUrl : `http://localhost:3333/files/${avatarUrl}`}
                                alt="Preview da imagem"
                                width={450}
                                height={300}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-300">
                                <FiUpload size={30} color="#ff6700" />
                            </div>
                        )}
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            Link de redirecionamento:
                            <input
                                type="text"
                                placeholder="Insira o link para redirecionamento..."
                                {...register("redirect_url")}
                                className="w-full border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>

                        <label>
                            Configurações da publicidade:
                            <Select
                                className="text-black z-40"
                                options={configurationMarketingOnPublication.map((typ) => ({
                                    value: typ.id,
                                    label: typ.name,
                                }))}
                                isMulti
                                placeholder="Selecione as configurações"
                                value={
                                    marketingPublicationData?.configurationMarketingOnPublication
                                        ? marketingPublicationData?.configurationMarketingOnPublication.map((item: { configurationMarketingType: { id: any; name: any; }; }) => ({
                                            value: item.configurationMarketingType.id,
                                            label: item.configurationMarketingType.name,
                                        }))
                                        : []
                                }
                                onChange={(selected) => {
                                    const updatedConfigs = selected.map((item) => ({
                                        configurationMarketingType: {
                                            id: item.value,
                                            name: item.label,
                                        },
                                    }));
                                    const updatedIds = updatedConfigs.map((config) => config.configurationMarketingType.id);
                                    setSelectedConfigsMarketing(updatedIds);
                                    setMarketingPublicationData((prev) =>
                                        prev
                                            ? {
                                                ...prev,
                                                configurationMarketingOnPublication: updatedConfigs,
                                            }
                                            : null
                                    );
                                }}

                            />
                        </label>
                    </div>

                    <div className="mt-8">
                        <label>
                            Status:&nbsp;&nbsp;
                            <select {...register("status")} className="border-2 rounded-md px-3 py-2 text-black">
                                <option value="">Selecione o status</option>
                                <option value="Disponivel">Disponível</option>
                                <option value="Indisponivel">Indisponível</option>
                                <option value="Programado">Programado</option>
                            </select>
                        </label>
                        &nbsp;&nbsp;
                        <label>
                            Agende o inicio da publicidade:&nbsp;&nbsp;
                            <input
                                type="datetime-local"
                                {...register("publish_at_start")}
                                className="border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                        &nbsp;&nbsp;
                        <label>
                            Agende o fim da publicidade:&nbsp;&nbsp;
                            <input
                                type="datetime-local"
                                {...register("publish_at_end")}
                                className="border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-52 py-3 text-white ${loading ? "bg-gray-500" : "bg-red-600 hover:bg-orange-600"} rounded-md`}
                    >
                        {loading ? "Atualizando..." : "Atualizar Publicidade"}
                    </button>
                </form>
            </Section>
        </SidebarAndHeader>
    );
}