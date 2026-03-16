import { useState, useEffect } from 'react';
import { getStorefrontCategories, getStorefrontCategoriesByBrand, type StorefrontCategory } from '@/src/services/storefrontService';

export const useCategories = (brandId?: string) => {
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = brandId 
          ? await getStorefrontCategoriesByBrand(brandId)
          : await getStorefrontCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [brandId]);

  return { data: categories, loading };
};
