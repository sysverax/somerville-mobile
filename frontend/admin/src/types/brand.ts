export interface BrandDocument {
  id: string;
  name: string;
  description: string;
  iconImageUrl: string | null;
  bannerImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // UI fields.
  iconImage: string;
  bannerImage: string | null;
  // Optional API-native fields for compatibility.
  iconImageUrl?: string | null;
  bannerImageUrl?: string | null;
}
