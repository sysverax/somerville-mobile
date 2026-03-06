export interface SeriesDocument {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Series {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Derived for UI filtering and display.
  brandId: string;
  image: string;
  // Optional API-native field for compatibility.
  imageUrl?: string | null;
}
