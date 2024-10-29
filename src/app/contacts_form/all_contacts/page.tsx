"use client";

import { LoadingRequest } from "@/app/components/loadingRequest";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { useState } from "react";
import DataTable from "@/app/components/dataTable";

interface ContactsProps {
    id: string;
    name_user: string;
    email_user: string;
    created_at: string;
}

export default function All_contacts() {

    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<ContactsProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const apiClient = setupAPIClient();

    async function fetchContacts({ page, limit, search, orderBy, orderDirection }: any) {
        try {
            /* setLoading(true); */
            const response = await apiClient.get(`/contacts_form/all_contacts`, {
                params: { page, limit, search, orderBy, orderDirection }
            });
            setContacts(response.data.contacts);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        } finally {
            /* setLoading(false); */
        }
    }


    return (
        <>
            {loading ? (
                <LoadingRequest />
            ) : (
                <SidebarAndHeader>
                    <Section>
                        <TitlePage title="TODOS OS CONTATOS" />
                        <DataTable
                            data={contacts}
                            columns={[
                                { key: "name_user", label: "Nome" },
                                { key: "email_user", label: "Email" },
                                { key: "created_at", label: "Data de Criação" }
                            ]}
                            totalPages={totalPages}
                            onFetchData={fetchContacts}
                            url_item_router="/contacts_form/all_contacts"
                            url_delete_data="/form_contact/delete_form_contatct"
                        />
                    </Section>
                </SidebarAndHeader>
            )}
        </>
    );
}