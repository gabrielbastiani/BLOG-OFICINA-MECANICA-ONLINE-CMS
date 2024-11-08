"use client"

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";


export default function All_categories() {

    return (
        <SidebarAndHeader children={
            <Section>

                <TitlePage title="TODAS AS CATEGORIAS" />



            </Section>
        } />
    );
}