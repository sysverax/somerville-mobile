import { useState, useEffect } from 'react';
import { getAllBrands } from '@/src/services/brandService';
import type { StorefrontBrand } from '@/src/services/storefrontService';

export const useBrands = () => {
  const [brands, setBrands] = useState<StorefrontBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBrands('asc').then(data => {
      const mapped = data.map(b => ({
        id: b.id,
        name: b.name,
        logo: b.iconImage,
        description: b.description,
        isActive: b.isActive,
      }));
      setBrands(mapped);
      setLoading(false);
    });
  }, []);

  return { data: brands, loading };
};
