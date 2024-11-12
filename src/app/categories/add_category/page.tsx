"use client";

import { useContext, useEffect, useState } from "react";
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
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);

    const refetchCategories = () => {
        const event = new CustomEvent("refetchCategories");
        window.dispatchEvent(event);
    };

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        const fetchAvailableCategories = async () => {
            try {
                const apiClient = setupAPIClient();
                const response = await apiClient.get('/category/cms',);
                setAvailableCategories(response.data.all_categories_disponivel);
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
            }
        };

        fetchAvailableCategories();

    }, []);

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
            refetchCategories();
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

                    <div className="mb-4">
                        <label htmlFor="parentId" className="block text-sm font-medium text-white">Subcategoria de alguma categoria?</label>
                        <select
                            {...register("parentId")}
                            className="border-2 rounded-md h-12 px-3 w-full max-w-sm text-black"
                            defaultValue=""
                        >
                            <option value="" disabled>Selecione uma categoria para se relacionar se desejar...</option>
                            {availableCategories.map(category => (
                                <option className="text-black" key={category.id} value={category.id}>
                                    {category.name_category}
                                </option>
                            ))}
                        </select>
                        {errors.parentId && <p className="text-red-500 text-xs">{errors.parentId.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="w-full md:w-80 px-6 py-3 bg-backgroundButton text-white rounded hover:bg-hoverButtonBackground transition duration-300">
                        {loading ? "Cadastrando..." : "Cadastrar Categoria"}
                    </button>
                </form>

                <CategoriesList refetchCategories={refetchCategories} />

            </Section>
        </SidebarAndHeader>
    );
}