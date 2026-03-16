import { useState, useEffect } from 'react';
import { getFilterOptions, type FilterOptions } from '@/src/services/filterService';

export const useFilterOptions = () => {
  const [data, setData] = useState<FilterOptions>({
    brands: [],
    categories: [],
    series: [],
    products: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    getFilterOptions().then(options => {
      if (isMounted) {
        setData(options);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading };
};
