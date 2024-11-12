import React from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Category } from "../../../../../Types/types";

interface CategoryTreeProps {
    categories: Category[];
    moveCategory: (draggedId: string, targetId: string | null) => void;
    level?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, moveCategory, level = 0 }) => {
    return (
        <DndProvider backend={HTML5Backend}>
            <ul className={`space-y-3 ${level === 0 ? "ml-0" : "ml-6"}`}>
                {categories.map((category) => (
                    <CategoryItem key={category.id} category={category} moveCategory={moveCategory} level={level} />
                ))}
            </ul>
        </DndProvider>
    );
};

const CategoryItem: React.FC<{ category: Category; moveCategory: (draggedId: string, targetId: string | null) => void; level: number }> = ({ category, moveCategory, level }) => {
    const [, ref] = useDrag({
        type: "category",
        item: { id: category.id },
    });

    const [, drop] = useDrop({
        accept: "category",
        hover: (dragged) => {/* @ts-ignore */
            if (dragged.id !== category.id) {/* @ts-ignore */
                moveCategory(dragged.id, category.id);
            }
        },
    });

    return (/* @ts-ignore */
        <li ref={(node) => ref(drop(node))} className="space-y-2">
            <div
                className={`p-4 rounded-md shadow-md transition transform hover:scale-105 ${level === 0 ? "bg-blue-600 text-white" :
                    level === 1 ? "bg-green-100 text-green-900" :
                        level === 2 ? "bg-yellow-100 text-yellow-900" :
                            "bg-gray-100 text-gray-900"
                    }`}
            >
                <span className="font-semibold text-lg">{category.name_category}</span>
                {category.description && <p className="text-sm text-gray-700 mt-1">{category.description}</p>}
            </div>
            {(category.children ?? []).length > 0 && (
                <div className="ml-4 border-l-2 pl-4 border-gray-300">
                    <CategoryTree categories={category.children ?? []} moveCategory={moveCategory} level={level + 1} />
                </div>
            )}
        </li>
    );
};

export default CategoryTree;