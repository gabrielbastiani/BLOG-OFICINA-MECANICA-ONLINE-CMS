"use client";

import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { z } from "zod";
import { setupAPIClient } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import { Input } from "@/app/components/input";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { Section } from "@/app/components/section";
import { TitlePage } from "@/app/components/titlePage";
import CategoriesList from "@/app/components/categories/categoriesList";

const schema = z.object({
    name_category: z.string().nonempty("O campo nome é obrigatório"),
    parentId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddCategory() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const apiClient = setupAPIClient();
            await apiClient.post('/category/create', {
                user_id: user?.id,
                name_category: data.name_category,
                parentId: data.parentId || null,
            });
            toast.success('Categoria cadastrada com sucesso!');
            reset();
        } catch (error) {
            toast.error('Erro ao cadastrar a categoria.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="ADICIONAR CATEGORIA" />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        styles="border-2 rounded-md h-12 px-3 w-full max-w-sm mb-4"
                        type="text"
                        placeholder="Digite um nome..."
                        name="name_category"
                        error={errors.name_category?.message}
                        register={register}
                    />
                    <Input
                        styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                        type="text"
                        placeholder="Subcategoria de alguma categoria?..."
                        name="parentId"
                        register={register}
                    />
                    <button type="submit" disabled={loading} className="mt-4">
                        {loading ? "Cadastrando..." : "Cadastrar Categoria"}
                    </button>
                </form>

                <CategoriesList />

            </Section>
        </SidebarAndHeader>
    );
}