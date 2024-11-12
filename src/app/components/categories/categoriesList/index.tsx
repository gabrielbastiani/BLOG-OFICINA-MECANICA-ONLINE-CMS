import { useEffect, useState } from "react";
import { setupAPIClient } from "@/services/api";
import { Category } from "../../../../../Types/types";
import CategoryTree from "../categoryTree";

const CategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get('/category/cms');
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtra as categorias pai (aquelas sem parentId)
  const parentCategories = categories.filter(category => !category.parentId);

  return (
    <div className="mt-6 px-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Renderiza cada categoria pai com suas subcategorias */}
        {parentCategories.map(parentCategory => (
          <div key={parentCategory.id} className="p-4 rounded-lg shadow-lg bg-slate-400">
            <CategoryTree categories={[parentCategory]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesList;