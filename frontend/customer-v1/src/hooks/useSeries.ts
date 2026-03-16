import { useState, useEffect } from 'react';
import { getStorefrontSeriesByCategory, getStorefrontSeries, type StorefrontSeries } from '@/src/services/storefrontService';

export const useSeries = (categoryId?: string) => {
  const [series, setSeries] = useState<StorefrontSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const data = categoryId 
          ? await getStorefrontSeriesByCategory(categoryId)
          : await getStorefrontSeries();
        setSeries(data);
      } catch (error) {
        console.error('Failed to fetch series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [categoryId]);

  return { data: series, loading };
};
