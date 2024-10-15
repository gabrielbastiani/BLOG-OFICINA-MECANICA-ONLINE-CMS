"use client"

import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { SidebarAndHeader } from "../components/sidebarAndHeader";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { setupAPIClient } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import Image from "next/image";

export default function Perfil() {
    const { user } = useContext(AuthContext);

    const [avatarUrl, setAvatarUrl] = useState(user?.image_user ? `http://localhost:3333/files/${user.image_user}` : '');
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

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

        if (image.type === 'image/jpeg' || image.type === 'image/png') {
            setPhoto(image);
            setAvatarUrl(URL.createObjectURL(image)); 
        }
    }

    async function handleRegisterPhoto(event: FormEvent) {
        event.preventDefault();

        try {
            const data = new FormData();

            if (!photo) {
                toast.error('Carregue uma imagem!');
                return;
            }

            if (!user) {
                toast.error('Usuário não encontrado!');
                return;
            }

            setLoading(true);

            data.append('user_id', user.id);
            data.append('file', photo);

            const apiClient = setupAPIClient();

            await apiClient.put('/user/update', data);

            toast.success('Foto do usuário atualizada com sucesso');

            setPhoto(null);

        } catch (err) {
            toast.error('Ops, erro ao atualizar a foto!');
        } finally {
            setLoading(false);
        }
    }

    return (
        <SidebarAndHeader children={
            <section className="p-10">

                <h1 className="font-bold text-4xl mb-16">PERFIL</h1>

                <div>
                    <form onSubmit={handleRegisterPhoto} className="flex flex-col space-y-4 w-80 items-center">
                        <label className="relative w-[150px] h-[150px] rounded-full cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
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
                                        width={150}
                                        height={150}
                                        alt="Foto do usuário"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                                    <FiUpload size={30} color="#ff6700" />
                                </div>
                            )}
                        </label>

                        <p>Carregue uma nova foto sua se desejar</p>

                        {photo ? (
                            <div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300"
                                    disabled={loading}
                                >
                                    {loading ? 'Salvando...' : 'Salvar nova foto'}
                                </button>
                            </div>
                        ) : null}
                    </form>
                </div>
            </section>
        } />
    );
}