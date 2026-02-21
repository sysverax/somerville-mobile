export interface Product {
  id: string;
  seriesId: string;
  categoryId: string;
  brandId: string;
  name: string;
  description: string;
  specifications: Record<string, string>;
  iconImage: string;
  galleryImages: string[];
  isActive: boolean;
  createdAt: string;
}
