import { useState, useCallback, useEffect } from 'react';
import { FilterOptionsResponse } from '@/types';
import { filterService } from '@/services/filter.service';

export const useFilterOptions = () => {
  const [data, setData] = useState<FilterOptionsResponse>({
    brands: [],
    categories: [],
    series: [],
    products: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const options = await filterService.getOptions();
      setData(options);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { 
    ...data, 
    isLoading, 
    refresh 
  };
};
