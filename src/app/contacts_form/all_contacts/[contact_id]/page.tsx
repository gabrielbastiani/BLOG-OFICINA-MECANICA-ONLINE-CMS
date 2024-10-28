"use client"

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { useEffect, useState } from "react";

interface ContactProps {
    id: string;
    name_user: string;
    slug_name_user: string;
    email_user: string;
    subject: string;
    menssage: string;
    created_at: string;
}

export default function Contact_id({ params }: { params: { contact_id: string } }) {

    const [contactData, setContactData] = useState<ContactProps>();

    useEffect(() => {
        const apiClient = setupAPIClient();
        async function load_contact() {
            try {
                const response = await apiClient.get(`/contacts_form/contact?form_contact_id=${params.contact_id}`);
                setContactData(response.data);
            } catch (error) {
                console.log(error);
            }
        }
        load_contact();
    }, []);


    return (
        <SidebarAndHeader>
            <Section>

                <TitlePage title="CONTATO" />

                <h2>{contactData?.name_user}</h2>

            </Section>
        </SidebarAndHeader>
    )
}