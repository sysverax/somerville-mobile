export interface FilterOption {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CategoryFilterOption extends FilterOption {
  brandId: string;
}

export interface SeriesFilterOption extends FilterOption {
  categoryId: string;
}

export interface FilterOptionsResponse {
  brands: FilterOption[];
  categories: CategoryFilterOption[];
  series: SeriesFilterOption[];
}
