"use client"

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";

export default function Add_category() {

    return (
        <SidebarAndHeader children={
            <Section>

                <TitlePage title="ADICIONAR CATEGORIA" />

                <div className="flex flex-col space-y-6 w-full max-w-md md:max-w-none">
                    <Input
                        styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                        type="text"
                        placeholder="Digite seu nome completo..."
                        name="name"
                        error={errors.name?.message}
                        register={register}
                    />
                </div>

            </Section>
        } />
    );
}