"use client"

import { Section } from "../components/section"; 
import { SidebarAndHeader } from "../components/sidebarAndHeader"; 
import { TitlePage } from "../components/titlePage"; 

export default function Dashboard() {

  return (
    <SidebarAndHeader children={
      <Section>

        <TitlePage title="DASHBOARD" />

        

      </Section>
    } />
  );
}