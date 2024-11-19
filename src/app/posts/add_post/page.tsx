"use client"

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import Image from "next/image";
import { Input } from "@/app/components/input";
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface FormDataProps {
    title: string;
    image_post?: string;
    description?: string;
    status?: string; // Adicione as propriedades que você precisa
    publish_at?: string;
    categories?: number[];
    tags?: string[];
}

interface Category {
    id: number;
    name_category: string;
}

interface Tag {
    id: number;
    tag_name: string;
}

/* type FormFields = {
    title: string;
    image_post?: string;
    description?: string;
    status?: string;
    publish_at?: string;
    categories?: number[];
    tags?: string[];
}; */

const schema = z.object({
    title: z.string().nonempty("O titulo é obrigatório"),
    image_post: z.string().optional(),
    text_post: z.string().optional(),
    status: z.enum(["Disponivel", "Indisponivel"]),
    publish_at: z.string().optional(),
    categories: z.array(z.number()).optional(),
    tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Add_post() {

    const editorRef = useRef<any>(null);

    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [image_post, setImage_post] = useState<File | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        async function fetchData() {
            const apiClient = setupAPIClient();
            const categoriesResponse = await apiClient.get('/category/cms');
            const tagsResponse = await apiClient.get('/tag/all_tags');
            setCategories(categoriesResponse.data.all_categories_disponivel);
            setTags(tagsResponse.data.tags);
        }
        fetchData();
    }, []);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setImage_post(image);
            setAvatarUrl(URL.createObjectURL(image));
            console.log("Imagem carregada:", image); // Adicionado para depuração
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    const onSubmit = async (data: FormDataProps) => {
        console.log("Dados do formulário:", data);
        setLoading(true);
        try {
            const content = editorRef.current?.getContent();
            if (!content) {
                toast.error("O conteúdo do post não pode estar vazio!");
                setLoading(false);
                return;
            }

            const formData = new FormData();

            console.log(Array.from(formData.entries()));


            formData.append("author", user?.name || "");
            formData.append("title", data.title);
            formData.append("text_post", editorRef.current?.getContent());
            formData.append("status", data.status || "");
            formData.append("publish_at", data.publish_at || "");
            formData.append("categories", JSON.stringify(data.categories || []));
            formData.append("tags", JSON.stringify(data.tags || []));

            if (image_post) {
                formData.append("file", image_post);
            }

            const apiClient = setupAPIClient();
            await apiClient.post('/post/create_post', formData);

            toast.success("Post cadastrado com sucesso!");
            reset();

        } catch (error) {
            toast.error("Erro ao cadastrar a categoria.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="CADASTRAR POST" />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label className="relative w-full h-[200px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden mb-6">
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 transition-opacity duration-300">
                            <FiUpload size={30} color="#ff6700" />
                        </span>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleFile}
                            className="hidden"
                        />
                        {avatarUrl ? (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                <Image
                                    className="object-cover w-full h-full"
                                    src={avatarUrl}
                                    width={250}
                                    height={200}
                                    alt="Preview da imagem"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <FiUpload size={30} color="#ff6700" />
                            </div>
                        )}
                    </label>

                    <Input
                        styles="border-2 rounded-md h-12 px-3 w-full text-black"
                        type="text"
                        placeholder="Digite um titulo..."
                        name="title"
                        error={errors.title?.message}
                        register={register}
                    />

                    <select
                        multiple
                        {...register("categories", { required: true })}
                        className="border-2 rounded-md h-12 px-3 w-full text-black"
                    >
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name_category}
                            </option>
                        ))}
                    </select>

                    <select
                        multiple
                        {...register("tags", { required: true })}
                        className="border-2 rounded-md h-12 px-3 w-full text-black"
                    >
                        {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                {tag.tag_name}
                            </option>
                        ))}
                    </select>


                    <select
                        {...register("status", { required: true })}
                        className="border-2 rounded-md h-12 px-3 w-full text-black"
                    >
                        <option value="">Selecione o status</option>
                        <option value="Disponivel">Disponível</option>
                        <option value="Indisponivel">Indisponível</option>
                    </select>

                    <input
                        type="datetime-local"
                        {...register("publish_at", { required: true })}
                        className="border-2 rounded-md h-12 px-3 w-full text-black"
                    />


                    <Editor
                        apiKey='3uadxc7du623dpn0gcvz8d1520ngvsigncyxnuj5f580qyz4'
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        initialValue="<p>Digite seu conteúdo aqui...</p>"
                        init={{
                            height: 500,
                            menubar: false,
                            plugins: [
                                'advlist autolink lists link image charmap preview anchor',
                                'searchreplace visualblocks code fullscreen',
                                'insertdatetime media table paste code help wordcount'
                            ],
                            toolbar:
                                'undo redo | formatselect | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help',
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-6 py-3 text-white rounded transition duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-backgroundButton hover:bg-hoverButtonBackground"
                            }`}
                    >
                        {loading ? "Cadastrando..." : "Cadastrar Post"}
                    </button>

                </form>
            </Section>
        </SidebarAndHeader>
    )
}