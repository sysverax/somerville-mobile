import { useState, useEffect } from 'react';
import { getStorefrontSeries } from '@/src/services/storefrontService';
import type { StorefrontSeries } from '@/src/services/storefrontService';

export const useSeries = () => {
  const [series, setSeries] = useState<StorefrontSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStorefrontSeries('desc').then(data => {
      setSeries(data);
      setLoading(false);
    });
  }, []);

  return { data: series, loading };
};
