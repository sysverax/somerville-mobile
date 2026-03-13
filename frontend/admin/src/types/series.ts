export interface SeriesDocument {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  brand?: {
    id: string;
    name: string;
    isActive: boolean;
  };
  category?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export interface Series {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  brandId: string;
  image: string;
  imageUrl?: string | null;
  brand?: {
    id: string;
    name: string;
    isActive: boolean;
  };
  category?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}
