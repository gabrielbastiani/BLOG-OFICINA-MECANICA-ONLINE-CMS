export interface Category {
    id: string;
    name_category: string;
    slug_name_category: string;
    image_category?: string;
    description?: string;
    order?: number;
    status: "Disponivel" | "Indisponivel";
    parentId?: string | null;
    nivel?: number;
    length?: number;
    children?: Category[];
    created_at: string;
    updated_at: string;
  }
  