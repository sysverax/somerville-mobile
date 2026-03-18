import { useState, useEffect } from 'react';
import { getStorefrontProductsBySeries, getStorefrontProducts, type StorefrontProduct } from '@/src/services/storefrontService';

export const useProducts = (seriesId?: string) => {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = seriesId 
          ? await getStorefrontProductsBySeries(seriesId)
          : await getStorefrontProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [seriesId]);

  return { data: products, loading };
};
