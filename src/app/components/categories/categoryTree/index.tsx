import React from "react";
import { Category } from "../../../../../Types/types";

interface CategoryTreeProps {
    categories: Category[];
    level?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, level = 0 }) => {
    return (
        <ul className={`space-y-3 ${level === 0 ? "ml-0" : "ml-6"}`}>
            {categories.map((category) => (
                <li key={category.id} className="space-y-2">
                    <div
                        className={`p-4 rounded-md shadow-md transition transform hover:scale-105 ${level === 0 ? "bg-hoverButtonBackground text-black" :
                            level === 1 ? "bg-green-100 text-green-900" :
                                level === 2 ? "bg-yellow-100 text-yellow-900" :
                                    "bg-gray-100 text-gray-900"
                            }`}
                    >
                        <span className="font-semibold text-lg">{category.name_category}</span>
                        {category.description && (
                            <p className="text-sm text-gray-700 mt-1">{category.description}</p>
                        )}
                    </div>
                    {/* Renderiza recursivamente as subcategorias, se existirem */}
                    {(category.children ?? []).length > 0 && (
                        <div className="ml-4 border-l-2 pl-4 border-gray-300">
                            <CategoryTree categories={category.children ?? []} level={level + 1} />
                        </div>
                    )}

                </li>
            ))}
        </ul>
    );
};

export default CategoryTree;