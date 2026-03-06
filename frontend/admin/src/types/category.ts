export interface CategoryDocument {
  id: string;
  brandId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  brandId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // UI compatibility alias.
  image: string;
  // Optional API-native field for compatibility.
  imageUrl?: string | null;
}
