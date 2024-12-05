import { setupAPIClient } from "@/services/api";
import { useEffect } from "react";

export default function PostPage({ params }: { params: { post_id: string } }) {



  useEffect(() => {
    const updateViews = async () => {
      const apiClient = setupAPIClient();
      try {
        await apiClient.patch(`/post/${params.post_id}/views`);
      } catch (error) {
        console.error("Failed to update views:", error);
      }
    };

    updateViews();
  }, [params.post_id]);

  return (
    <div>
      <h1>{params.post_id}</h1>
      
    </div>
  );
}