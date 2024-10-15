"use client"

import { SidebarAndHeader } from "./components/sidebarAndHeader";

export default function Dashboard() {

  return (
    <SidebarAndHeader children={
      <section>
        <h1>Dashboard</h1>
      </section>
    } />
  );
}