"use client";

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import Image from "next/image";
import Select from "react-select";

interface FormDataProps {
    title: string;
    image_url?: string;
    description?: string;
    status?: string;
    publish_at_start?: string;
    publish_at_end?: string;
    redirect_url?: string;
    local_site?: string;
    popup_position?: string;
    popup_behavior?: string;
    popup_conditions?: string[];
}

const schema = z.object({
    title: z.string().nonempty("O título é obrigatório"),
    image_url: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["Disponivel", "Indisponivel"], {
        errorMap: () => ({ message: "Selecione um status válido" }),
    }),
    publish_at_start: z.string().optional(),
    publish_at_end: z.string().optional(),
    redirect_url: z.string().optional(),
    local_site: z.string().optional(),
    popup_position: z.string().optional(),
    popup_behavior: z.string().optional(),
    popup_conditions: z.string().array().optional(),
});

type FormData = z.infer<typeof schema>;

const routes_pages = [
    { page: "Página inicial", value: '/' },
    { page: "Página do post", value: '/postPage' },
]

export default function Add_content_marketing() {

    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [image_url, setImage_post] = useState<File | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    const onChangeCheckbox = () => {
        setIsChecked((prev) => !prev);
    };

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setImage_post(image);
            setAvatarUrl(URL.createObjectURL(image));
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    const onSubmit = async (data: FormDataProps) => {
        setLoading(true);

        if (isChecked === false) {
            setSelectedConditions([]);
        }

        console.log(JSON.stringify(selectedConditions))

        try {
            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("description", data.description || "");
            formData.append("status", data.status || "");
            formData.append("publish_at_start", data.publish_at_start || "");
            formData.append("publish_at_end", data.publish_at_end || "");
            formData.append("redirect_url", data.redirect_url || "");
            formData.append("local_site", data.local_site || "");
            formData.append("is_popup", isChecked ? "true" : "false");
            formData.append("popup_position", data.popup_position || "");
            formData.append("popup_behavior", data.popup_behavior || "");
            formData.append("popup_conditions", JSON.stringify(isChecked ? selectedConditions : null));

            if (image_url) {
                formData.append("file", image_url);
            }

            const apiClient = setupAPIClient();
            await apiClient.post("/marketing_publication/create", formData);

            toast.success("Publicidade cadastrada com sucesso!");

            reset();
            setAvatarUrl(null);
            setImage_post(null);
            setSelectedConditions([]);
        } catch (error) {
            console.log(error)
            toast.error("Erro ao cadastrar a publicidade.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="CADASTRAR PUBLICIDADE" />
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Input para Título */}
                    <input
                        type="text"
                        placeholder="Digite um título para publiciddade..."
                        {...register("title")}
                        className="w-full border-2 rounded-md px-3 py-2 text-black"
                    />

                    {/* Input para ativar popup */}
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={onChangeCheckbox}
                            className="mr-2 min-h-8 min-w-7"
                        />
                        A publicidade estará em um popup?
                    </label>

                    {isChecked ? (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Select referente ao comportamento para o popup */}
                            <select {...register("popup_behavior")} className="border-2 rounded-md px-3 py-2 text-black">
                                <option value="">Selecione o comportamento para o popup</option>
                                <option value="on_load">Em quanto carrega uma página</option>
                                <option value="on_scroll">Em quanto rola a página</option>
                            </select>

                            {/* Select referente a posição do popup no site */}
                            <select {...register("popup_position")} className="border-2 rounded-md px-3 py-2 text-black">
                                <option value="">Selecione o local do popup</option>
                                <option value="top-right">Parte superior direita</option>
                                <option value="center">Parte central</option>
                            </select>

                            {/* Select referente a condição para esse popup */}
                            <Select
                                options={routes_pages.map((rout, index) => ({ key: index, value: rout.value, label: rout.page }))}
                                isMulti
                                placeholder="Selecione página(s)"
                                className="basic-multi-select text-black"
                                classNamePrefix="select"
                                onChange={(selected) =>
                                    setSelectedConditions(selected.map((item: any) => item.value))
                                }
                            />
                        </div>
                    ) : null}

                    {/* Input para Imagem */}
                    <label className="relative w-full h-[450px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                        <input type="file" accept="image/png, image/jpeg" onChange={handleFile} className="hidden" />
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt="Preview da imagem" width={250} height={200} className="object-cover w-full h-full" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-300">
                                <FiUpload size={30} color="#ff6700" />
                            </div>
                        )}
                    </label>

                    {/* Textarea para Descrição */}
                    <textarea
                        placeholder="Digite uma desecrição..."
                        {...register("description")}
                        className="h-56 p-3 w-full resize-none border-2 rounded-md px-3 py-2 text-black"
                    />

                    {/* Input para Link da publicação */}
                    <input
                        type="text"
                        placeholder="Link da publicação..."
                        {...register("redirect_url")}
                        className="w-full border-2 rounded-md px-3 py-2 text-black"
                    />

                    {/* Seletores em linha */}
                    <div className="grid grid-cols-2 gap-4">
                        {isChecked ? (
                            null
                        ) :
                            <>
                                {/* Select referente ao local a ser publicado no blog */}
                                <select {...register("local_site")} className="border-2 rounded-md px-3 py-2 text-black">
                                    <option value="">Selecione o local no site</option>
                                    <option value="top_home">Home parte superior</option>
                                    <option value="inside-post">Página de post</option>
                                </select>
                            </>
                        }

                        {/* Select referente ao status */}
                        <select {...register("status")} className="border-2 rounded-md px-3 py-2 text-black">
                            <option value="">Selecione o status</option>
                            <option value="Disponivel">Disponível</option>
                            <option value="Indisponivel">Indisponível</option>
                        </select>

                    </div>

                    {/* Seletores em linha */}
                    <div className="grid grid-cols-2 gap-4">

                        <label>
                            Data para o inicio da publicidade: &nbsp;&nbsp;
                            <input
                                type="datetime-local"
                                {...register("publish_at_start")}
                                className="border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>

                        <label>
                            Data do término da publicidade: &nbsp;&nbsp;
                            <input
                                type="datetime-local"
                                {...register("publish_at_end")}
                                className="border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>

                    </div>

                    {/* Botão de cadastro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded bg-backgroundButton text-white ${loading ? "opacity-50" : "hover:bg-hoverButtonBackground"
                            }`}
                    >
                        {loading ? "Cadastrando..." : "Cadastrar publicidade"}
                    </button>
                </form>

            </Section>
        </SidebarAndHeader>
    );
}