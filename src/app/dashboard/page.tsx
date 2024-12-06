"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { setupAPIClient } from "@/services/api";
import { SidebarAndHeader } from "../components/sidebarAndHeader";
import { Section } from "../components/section";
import { TitlePage } from "../components/titlePage";
import ScheduledPostsCalendar from "../components/datasDashboard/scheduledPostsCalendar";
import { PostData } from "../components/datasDashboard/postData";
import { CategoriesData } from "../components/datasDashboard/categoriesData";
import { CommentData } from "../components/datasDashboard/commentData";
import { FormContactData } from "../components/datasDashboard/formContactData";
import { UsersData } from "../components/datasDashboard/usersData";
import { NewslattersData } from "../components/datasDashboard/newslattersData";
import { ViewsPostsData } from "../components/datasDashboard/viewsPostsData";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {

  const [postData, setPostData] = useState<any>({});
  const [postViewsMetrics, setPostViewsMetrics] = useState<{
    dailyViews: { title: string; views: number }[];
    weeklyViews: { title: string; views: number }[];
    monthlyViews: { title: string; views: number }[];
  } | null>(null);
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
      const usersResponse = await apiClient.get("/dashboard/userBlog/statistics");

      setPostData(postsResponse.data);
      setPostViewsMetrics(postsResponse.data);
      setCategoryData(categoriesResponse.data);
      setCommentData(commentsResponse.data);
      setContactData(contactsResponse.data);
      setNewsletterData(newsletterData.data);
      setUserData(usersResponse.data);
    };

    fetchData();
  }, []);


  return (
    <SidebarAndHeader>
      <Section>

        <TitlePage title="DASHBOARD" />

        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PostData
              postData={postData}
            />
            <ScheduledPostsCalendar />
            <CategoriesData
              categoryData={categoryData}
            />
            <CommentData
              commentData={commentData}
            />
            <FormContactData
              contactData={contactData}
            />
            <UsersData
              userData={userData}
            />
            <NewslattersData
              newsletterData={newsletterData}
            />
          </div>
          <ViewsPostsData
            postViewsMetrics={postViewsMetrics}
          />
        </div>
      </Section>
    </SidebarAndHeader>
  );
}