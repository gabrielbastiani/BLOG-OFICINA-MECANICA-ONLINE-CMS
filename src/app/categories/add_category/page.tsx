"use client";

import { Input } from "@/app/components/input";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { DndContext, useDraggable, useDroppable, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

type Category = {
    id: string;
    name_category: string;
    parentId: string | null;
    image_category?: string;
    order?: number;
    children?: Category[];
};

const schema = z.object({
    name_category: z.string().nonempty("O campo nome é obrigatório"),
    parentId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddCategory() {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    async function onSubmit(data: FormData) {
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
            fetchCategories();  // Atualizar lista de categorias após adicionar uma nova
        } catch (error) {
            toast.error('Erro ao cadastrar a categoria.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCategories() {
        const apiClient = setupAPIClient();
        const response = await apiClient.get('/category/cms');
        setCategories(response.data);
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    // Draggable item com filhos
    const DraggableItem = ({ category }: { category: Category }) => {
        const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: category.id });

        const style = {
            transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
        };

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                {category.name_category}
                {category.children && (
                    <div style={{ paddingLeft: "1rem" }}>
                        {category.children.map((child) => (
                            <DraggableItem key={child.id} category={child} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const CategoriesList = ({ categories }: { categories: Category[] }) => (
        <div>
            {categories.map((category) => (
                <DraggableItem key={category.id} category={category} />
            ))}
        </div>
    );

    // Função para lidar com o fim do arrasto
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
    
        // Verifique se o item foi realmente movido
        if (!over || active.id === over.id) return;

        console.log("Item ativo:", active.id, "Item sobre:", over?.id);
    
        // Encontre os índices dos itens de origem e destino
        const activeIndex = categories.findIndex(category => category.id === active.id);
        const overIndex = categories.findIndex(category => category.id === over.id);
    
        if (activeIndex === -1 || overIndex === -1) return;
    
        // Crie uma nova lista com a ordem atualizada
        const newCategories = [...categories];
        const [movedItem] = newCategories.splice(activeIndex, 1); // Remove o item
        newCategories.splice(overIndex, 0, movedItem); // Insere no novo índice
    
        // Atualize o estado com a nova ordem local
        setCategories(newCategories);

        console.log("Nova ordem das categorias:", newCategories);
    
        // Mapear as categorias para atualizar com `order` e `parentId`
        const orderedCategories = newCategories.map((category, index) => ({
            id: category.id,
            order: index + 1,
            parentId: category.parentId
        }));
    
        try {
            const apiClient = setupAPIClient();
            await apiClient.put('/category/updateOrder', { categories: orderedCategories });
            toast.success("Ordem das categorias atualizada com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar a ordem das categorias.");
            console.error("Erro ao atualizar a ordem das categorias:", error);
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar Categoria"}
                    </button>
                </form>

                <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                    <CategoriesList categories={categories} />
                </DndContext>
            </Section>
        </SidebarAndHeader>
    );
}