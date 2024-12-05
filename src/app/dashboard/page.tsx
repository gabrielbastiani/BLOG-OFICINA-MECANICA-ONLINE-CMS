"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { setupAPIClient } from "@/services/api";
import { SidebarAndHeader } from "../components/sidebarAndHeader";
import { Section } from "../components/section";
import { TitlePage } from "../components/titlePage";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {

  const [postData, setPostData] = useState<any>({});
  const [categoryData, setCategoryData] = useState<any>({});
  const [commentData, setCommentData] = useState<any>({});
  const [contactData, setContactData] = useState<any>({});
  const [newsletterData, setNewsletterData] = useState<any>({});
  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const apiClient = setupAPIClient();

      const postsResponse = await apiClient.get("/dashboard/posts/statistics");
      const categoriesResponse = await apiClient.get("/dashboard/categories/statistics");
      const commentsResponse = await apiClient.get("/dashboard/comment/statistics");
      const contactsResponse = await apiClient.get("/dashboard/contact/statistics");
      const newsletterData = await apiClient.get("/dashboard/newslatter/statistics");
      /* const usersResponse = await apiClient.get("/dashboard/users/statistics"); */

      setPostData(postsResponse.data);
      setCategoryData(categoriesResponse.data);
      setCommentData(commentsResponse.data);
      setContactData(contactsResponse.data);
      setNewsletterData(newsletterData.data);
      /* setUserData(usersResponse.data); */
    };

    fetchData();
  }, []);

  const postChartData = {
    labels: postData.postsByStatus?.map((status: any) => status.status),
    datasets: [
      {
        label: "Posts por Status",
        data: postData.postsByStatus?.map((status: any) => status._count.id),
        backgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  const totalCategoriesChartData = {
    labels: ['Total Categorias'],
    datasets: [
      {
        label: 'Total Categorias',
        data: [categoryData.totalCategories],
        backgroundColor: ['#4BC0C0'],
      },
    ],
  };

  const subcategoriesChartData = {
    labels: categoryData.subcategories?.map((group: any) => group.parentName),
    datasets: [
      {
        label: 'Subcategories',
        data: categoryData.subcategories?.map((group: any) => group._count.id),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const commentChartData = {
    labels: commentData.commentsByStatus?.map((status: any) => status.status),
    datasets: [
      {
        label: "Comentários por Status",
        data: commentData.commentsByStatus?.map((status: any) => status._count.id),
        backgroundColor: ["#FFCE56", "#4BC0C0", "#FF6384"],
      },
    ],
  };

  const contactChartData = {
    labels: ["Hoje", "Semana", "Mês"],
    datasets: [
      {
        label: "Formulários de Contato",
        data: [contactData.dailyCount, contactData.weeklyCount, contactData.monthlyCount],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const newsletterChartData = {
    labels: ['Hoje', 'Esta Semana', 'Este Mês'],
    datasets: [
      {
        label: 'Newsletters Registradas',
        data: [
          newsletterData.dailyCount || 0,
          newsletterData.weeklyCount || 0,
          newsletterData.monthlyCount || 0,
        ],
        backgroundColor: ['#FFCE56', '#4BC0C0', '#FF6384'],
      },
    ],
  };

  const userGrowthData = {
    labels: ["Usuários"],
    datasets: [
      {
        label: "Crescimento (%)",
        data: [userData.growthRate],
        backgroundColor: ["#4BC0C0"],
      },
    ],
  };

  return (
    <SidebarAndHeader>
      <Section>

        <TitlePage title="DASHBOARD" />

        <div className="p-4 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Posts */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black">Posts</h3>
              <Pie data={postChartData} />
            </div>

            {/* Categorias */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black">Total de Categorias</h3>
              <Pie data={totalCategoriesChartData} />
              <h3 className="text-lg font-semibold text-black">Subcategorias por Categoria Pai</h3>
              <Bar data={subcategoriesChartData} />
            </div>

            {/* Comentários */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black">Comentários</h3>
              <Pie data={commentChartData} />
            </div>

            {/* Formulários de Contato */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black">Formulários de Contato</h3>
              <Bar data={contactChartData} />
            </div>

            <div className="chart bg-white shadow-md p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Newsletters</h3>
              <Bar data={newsletterChartData} />
            </div>

            {/* Usuários */}
            {/* <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold">Usuários Registrados</h3>
          <p className="text-xl font-bold">{userData.totalUsers}</p>
          <Bar data={userGrowthData} />
        </div> */}
          </div>
        </div>
      </Section>
    </SidebarAndHeader>
  );
}