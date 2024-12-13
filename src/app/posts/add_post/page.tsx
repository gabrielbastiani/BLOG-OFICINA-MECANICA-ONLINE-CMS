"use client";

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import Image from "next/image";
import Select from "react-select";
import { Editor } from "@tinymce/tinymce-react";
import BulkDatas from "@/app/components/BulkDatas"; 

interface FormDataProps {
    title: string;
    image_post?: string;
    description?: string;
    status?: string;
    publish_at?: string;
    categories?: string[];
    tags?: string[];
}

interface Category {
    id: string;
    name_category: string;
}

interface Tag {
    id: string;
    tag_name: string;
}

const schema = z.object({
    title: z.string().nonempty("O título é obrigatório"),
    image_post: z.string().optional(),
    text_post: z.string().optional(),
    status: z.enum(["Disponivel", "Indisponivel", "Programado"], {
        errorMap: () => ({ message: "Selecione um status válido" }),
    }),
    publish_at: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddPost() {
    const editorRef = useRef<any>(null);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [image_post, setImage_post] = useState<File | null>(null);

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
                const categoriesResponse = await apiClient.get("/category/cms");
                const tagsResponse = await apiClient.get("/tag/all_tags");
                setCategories(categoriesResponse.data.all_categories_disponivel);
                setTags(tagsResponse.data.tags_all);
            } catch (error) {
                toast.error("Erro ao carregar categorias e tags.");
            }
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
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    const onSubmit = async (data: FormDataProps) => {
        setLoading(true);
        try {
            const content = editorRef.current?.getContent();
            if (!content || content.trim() === "") {
                toast.error("O conteúdo do post não pode estar vazio!");
                setLoading(false);
                return;
            }

            if (data.status === "") {
                toast.error("Escolha um status para o seu post!!!");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("author", user?.name || "");
            formData.append("title", data.title);
            formData.append("text_post", content);
            formData.append("status", data.status || "");
            formData.append("publish_at", data.publish_at || "");
            formData.append("categories", JSON.stringify(selectedCategories));
            formData.append("tags", JSON.stringify(selectedTags));

            if (image_post) {
                formData.append("file", image_post);
            }

            const apiClient = setupAPIClient();
            await apiClient.post("/post/create_post", formData);

            toast.success("Post cadastrado com sucesso!");
            setSelectedCategories([]);
            setSelectedTags([]);
            reset();
            setAvatarUrl(null);
            setImage_post(null);
            editorRef.current?.setContent("");
        } catch (error) {
            console.log(error)
            toast.error("Erro ao cadastrar o post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="CADASTRAR POST" />
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                    {/* Input para Título */}
                    <input
                        type="text"
                        placeholder="Digite um título..."
                        {...register("title")}
                        className="w-full border-2 rounded-md px-3 py-2 text-black"
                    />

                    {/* Seletores em linha */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            options={categories.map((cat, index) => ({ key: index, value: cat.id, label: cat.name_category }))}
                            isMulti
                            placeholder="Selecione categorias"
                            className="basic-multi-select text-black z-10"
                            classNamePrefix="select"
                            onChange={(selected) =>
                                setSelectedCategories(selected.map((item: any) => item.value))
                            }
                        />
                        <Select
                            options={tags.map((tag, index) => ({ key: index, value: tag.id, label: tag.tag_name }))}
                            isMulti
                            placeholder="Selecione tags"
                            className="basic-multi-select text-black z-10"
                            classNamePrefix="select"
                            onChange={(selected) =>
                                setSelectedTags(selected.map((item: any) => item.value))
                            }
                        />
                        <select {...register("status")} className="border-2 rounded-md px-3 py-2 text-black">
                            <option value="">Selecione o status</option>
                            <option value="Programado">Programado</option>
                            <option value="Disponivel">Disponível</option>
                            <option value="Indisponivel">Indisponível</option>
                        </select>

                        <label>
                            Agende sua postagem: &nbsp;&nbsp;
                            <input
                                type="datetime-local"
                                {...register("publish_at")}
                                className="border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>

                    </div>

                    {/* Editor de texto */}
                    <Editor
                        apiKey="3uadxc7du623dpn0gcvz8d1520ngvsigncyxnuj5f580qyz4"
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        initialValue="<p>Digite seu conteúdo aqui...</p>"
                        init={{
                            height: 500,
                            menubar: true,
                            plugins: ["link", "lists", "image", "media", "advlist autolink lists link image charmap preview anchor",
                                "searchreplace visualblocks code fullscreen",
                                "insertdatetime media table paste code help wordcount",
                                "emoticons template codesample",],
                            toolbar: "undo redo | formatselect | bold italic | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image emoticons | table codesample | preview help",
                            codesample_languages: [
                                { text: "HTML/XML", value: "markup" },
                                { text: "JavaScript", value: "javascript" },
                                { text: "CSS", value: "css" },
                                { text: "PHP", value: "php" },
                                { text: "Ruby", value: "ruby" },
                                { text: "Python", value: "python" },
                            ],
                            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                    />

                    {/* Botão de cadastro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`fixed right-10 bottom-10 px-6 py-3 z-10 rounded bg-backgroundButton text-white ${loading ? "opacity-50" : "hover:bg-hoverButtonBackground z-10"
                            }`}
                    >
                        {loading ? "Cadastrando..." : "Cadastrar Post"}
                    </button>
                </form>

                <hr className="mt-6 mb-6" />

                <BulkDatas
                    link_donwload="/post/donwload_excel_posts?user_id"
                    name_file="posts.xlsx"
                    link_register_data="/post/bulk_posts?user_id"
                />
            </Section>
        </SidebarAndHeader>
    );
}