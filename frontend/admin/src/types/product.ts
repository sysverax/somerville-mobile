export interface ProductDocument {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Derived for UI filtering and display.
  categoryId: string;
  brandId: string;
  iconImage: string;
  specifications: Record<string, string>;
  galleryImages: string[];
  // Optional API-native field for compatibility.
  imageUrl?: string | null;
}
