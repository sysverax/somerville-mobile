"use client";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense, use, useEffect, useMemo } from "react";
import {
  getStorefrontBrandById,
  getStorefrontSeriesByCategory,
  getStorefrontSeries,
  type StorefrontBrand,
  type StorefrontSeries,
} from "@/src/services";
import { useFilterOptions } from "@/src/hooks/useFilterOptions";
import { useBrands } from "@/src/hooks/useBrands";
import Layout from "@/src/components/layout/Layout";
import CategoryCard from "@/src/components/cards/CategoryCard";
import SeriesCard from "@/src/components/cards/SeriesCard";
import BrandCard from "@/src/components/cards/BrandCard";
import ServiceContent from "@/src/components/brand/ServiceContent";
import ShopContent from "@/src/components/brand/ShopContent";

type Props = {
  params: Promise<{ id: string }>;  
};

const BrandContent = ({ params }: Props) => {
   const resolvedParams = use(params);
  const brandId = resolvedParams.id?.[0]; 
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode") || "service"; 
  
  const { data: filterOptions } = useFilterOptions();
  const { data: brands, loading: brandsLoading } = useBrands();
  const [brand, setBrand] = useState<StorefrontBrand | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);
  const categories = useMemo(() => {
    if (!brandId) return [];
    return filterOptions.categories.filter(c => c.brandId === brandId);
  }, [brandId, filterOptions.categories]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredSeries, setFilteredSeries] = useState<StorefrontSeries[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  useEffect(() => {
    if (brandId) {
      setLoadingBrand(true);
      getStorefrontBrandById(brandId).then(data => {
        setBrand(data || null);
        setLoadingBrand(false);
      });
    } else {
      setLoadingBrand(false);
    }
  }, [brandId]);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoadingSeries(true);
      try {
        if (selectedCategory) {
          const series = await getStorefrontSeriesByCategory(selectedCategory);
          setFilteredSeries(series);
        } else if (brandId && categories.length > 0) {
          // Fetch all series for all categories of this brand
          const allSeriesPromises = categories.map(cat => getStorefrontSeriesByCategory(cat.id));
          const allSeriesResults = await Promise.all(allSeriesPromises);
          setFilteredSeries(allSeriesResults.flat());
        } else {
          setFilteredSeries([]);
        }
      } catch (error) {
        console.error("Failed to fetch series:", error);
      } finally {
        setLoadingSeries(false);
      }
    };

    fetchSeries();
  }, [selectedCategory, brandId, categories]);

  // Handle loading state
  if (loadingBrand && brandId) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-dark">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // If no brand selected or not found, show brand selection page
  if (!brandId || !brand) {
    return (
      <Layout>
        <section className="py-12 bg-gradient-dark">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {mode === "service" ? "Select Your Device Brand" : "Shop by Brand"}
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mode === "service" 
                  ? "Choose your device brand to explore our repair services" 
                  : "Explore our curated selection of premium mobile devices"
                }
              </p>
            </motion.div>

            {brandsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {brands.map((b, index) => (
                  <BrandCard 
                    key={b.id} 
                    brand={b} 
                    index={index} 
                    href={`/brand/${b.id}?mode=${mode}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {mode === "service" ? <ServiceContent /> : <ShopContent />}
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-12 pb-4 sm:pb-12 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{brand.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 mb-8"
          >
            <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-secondary/50 flex items-center justify-center">
              <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl md:text-5xl font-bold break-words">{brand.name}</h1>
              <p className="text-muted-foreground mt-2">{brand.description}</p>
            </div>
          </motion.div>

          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {!selectedCategory && categories.length > 0 && (
        <section className="pt-2 pb-12">
          <div className="container mx-auto px-4">
            <motion.h2
               initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-8"
            >
              Categories
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8"
          >
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name} Series`
              : "All Product Series"
            }
          </motion.h2>
          
          {loadingSeries ? (
            <div className="flex justify-center py-12">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSeries.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeries.map((s, index) => (
                <SeriesCard key={s.id} series={s} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No product series available.
            </div>
          )}
        </div>
      </section>

      <ServiceContent brandId={brandId}/>
    </Layout>
  );
};

const BrandPage = ({ params }: Props) => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-dark" />}>
      <BrandContent params={params} />
    </Suspense>
  );
};

export default BrandPage;
