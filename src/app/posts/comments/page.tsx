"use client"

import DataTable from "@/app/components/dataTable";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { useState } from "react";

interface CommentProps {
    id: string;
    post_id: string;
    userBlog_id: string;
    comment: string;
    nivel?: number;
    parentId: string;
    status: string;
    created_at: string | number | Date;
    replies: string[];
    comment_like: number;
    commentLikes?: {
        isLike: boolean;
    };
}

const statusOptions = ["Fila", "Aprovar", "Rejeitar", "Spam", "Lixeira"];

export default function Comments() {

    const apiClient = setupAPIClient();

    const [all_comments, setAll_comments] = useState<CommentProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    async function fetchComments({ page, limit, search, orderBy, orderDirection, startDate, endDate }: any) {
        try {
            const response = await apiClient.get(`/comment/cms/get_comments`, {
                params: { page, limit, search, orderBy, orderDirection, startDate, endDate }
            });
            setAll_comments(response.data.comments);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        }
    }

    // ---- COLUNAS PARA EXPORTAÇÂO DE DADOS ---- //

    const availableColumns = [
        "id",
        "author",
        "title",
        "text_post",
        "post_like",
        "status",
        "publish_at",
        "tags",
        "categories",
        "created_at"
    ];

    const customNames: any = {
        id: "ID do Post",
        author: "Autor do post",
        title: "Titulo do Post",
        text_post: "Texto do post",
        post_like: "Número de likes",
        status: "Status",
        publish_at: "Publicação programada",
        tags: "Tags do post",
        categories: "Categorias do post",
        created_at: "Data de criação"
    };

    // ---- SELECT PARA ORDENAÇÂO DOS ---- //

    const columnsOrder: any = [
        { key: "title", label: "Titulo do Post" },
        { key: "created_at", label: "Data de Criação" },
        { key: "status", label: "Status" }
    ];

    const availableColumnsOrder: any = [
        "title",
        "created_at",
        "status"
    ];

    const customNamesOrder: any = {
        title: "Titulo do Post",
        created_at: "Data de criação",
        status: "Status"
    };


    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="COMENTARIOS" />

                <DataTable
                    generate_excel_delete=""
                    delete_bulk_data=""
                    modal_delete_bulk={false}
                    active_buttons_searchInput={false}
                    active_export_data={true}
                    customNamesOrder={undefined}
                    availableColumnsOrder={[]}
                    columnsOrder={undefined}
                    availableColumns={[]}
                    table_data="comment"
                    url_delete_data=""
                    data={[]}
                    totalPages={0}
                    onFetchData={function (params: { page: number; limit: number; search: string; orderBy: string; orderDirection: string; startDate?: string; endDate?: string; }): void {
                        throw new Error("Function not implemented.");
                    }}
                    columns={[]}
                />

            </Section>
        </SidebarAndHeader>
    )
}