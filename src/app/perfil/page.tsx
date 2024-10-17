"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";
import { SidebarAndHeader } from "../components/sidebarAndHeader";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { setupAPIClient } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import Image from "next/image";
import { Input } from "../components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TitlePage } from "../components/titlePage";
import { Section } from "../components/section";

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    email: z
        .string()
        .email("Insira um email válido")
        .nonempty("O campo email é obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function Perfil() {

    const { user, signOut } = useContext(AuthContext);

    const [avatarUrl, setAvatarUrl] = useState(
        user?.image_user ? `http://localhost:3333/files/${user.image_user}` : ""
    );
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        if (user?.image_user) {
            setAvatarUrl(`http://localhost:3333/files/${user.image_user}`);
        }
    }, [user?.image_user]);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            return;
        }

        const image = e.target.files[0];
        if (!image) {
            return;
        }

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setPhoto(image);
            setAvatarUrl(URL.createObjectURL(image));
        }
    }

    async function onSubmit(data: FormData) {
        try {
            setLoading(true);

            const apiClient = setupAPIClient();
            const formData = new FormData();

            if (!user) {
                toast.error('Usuário não encontrado!');
                return;
            }

            if (photo) {
                formData.append("file", photo);
            }

            formData.append("user_id", user.id);
            formData.append("name", data.name);
            formData.append("email", data.email);

            await apiClient.put("/user/update", formData);

            toast.success("Dados atualizados com sucesso!");

            setPhoto(null);
        } catch (error) {
            toast.error("Erro ao atualizar!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SidebarAndHeader
            children={
                <Section>

                    <TitlePage title="PERFIL" />

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col space-y-6 w-full max-w-md md:max-w-none"
                        >
                            <label className="relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-full cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 transition-opacity duration-300 rounded-full">
                                    <FiUpload size={30} color="#ff6700" />
                                </span>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleFile}
                                    className="hidden"
                                    alt="Foto do usuário"
                                />
                                {avatarUrl ? (
                                    <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                        <Image
                                            className="object-cover w-full h-full rounded-full"
                                            src={avatarUrl}
                                            width={180}
                                            height={180}
                                            alt="Foto do usuário"
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                                        <FiUpload size={30} color="#ff6700" />
                                    </div>
                                )}
                            </label>

                            <Input
                                styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                                type="text"
                                placeholder="Digite seu nome completo..."
                                name="name"
                                value={user?.name}
                                error={errors.name?.message}
                                register={register}
                            />

                            <Input
                                styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                                type="email"
                                placeholder="Digite seu email..."
                                name="email"
                                value={user?.email}
                                error={errors.email?.message}
                                register={register}
                            />

                            <button
                                type="submit"
                                className="w-full md:w-80 px-6 py-3 bg-backgroundButton text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                                disabled={loading}
                            >
                                {loading ? "Salvando..." : "Salvar alterações"}
                            </button>

                        </form>
                    </div>

                    <button
                        onClick={signOut}
                        className="mt-24 w-full md:w-80 px-6 py-3 bg-red-600 text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                        disabled={loading}
                    >
                        {loading ? "Saindo..." : "Sair da conta"}
                    </button>

                </Section>
            }
        />
    );
}