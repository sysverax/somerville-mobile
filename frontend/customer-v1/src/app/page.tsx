"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  type StorefrontSeries,
  type StorefrontProduct,
} from "@/src/services";
import { useFilterOptions } from "@/src/hooks/useFilterOptions";
import { useBrands } from "@/src/hooks/useBrands";
import { useSeries } from "@/src/hooks/useSeries";
import BrandCard from "@/src/components/cards/BrandCard";
import SeriesCard from "@/src/components/cards/SeriesCard";
import Layout from "@/src/components/layout/Layout";
import ProductFilterCard from "@/src/components/home/ProductFilterCard";
import ServiceInfoCards from "@/src/components/home/ServiceInfoCards";

const Index = () => {
  const { data: filterOptions, loading: filterLoading } = useFilterOptions();
  const { data: brands, loading: brandsLoading } = useBrands();
  const { data: allSeries, loading: seriesLoading } = useSeries();
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
  const [seriesAtStart, setSeriesAtStart] = useState(true);
  const [seriesAtEnd, setSeriesAtEnd] = useState(false);

  const latestSeries = useMemo(() => allSeries.slice(0, 3), [allSeries]);

  useEffect(() => {
    if (latestSeries.length <= 1) return;
    const interval = setInterval(() => {
      const container = document.getElementById('series-scroll-container');
      if (container) {
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const cardWidth = container.scrollWidth / latestSeries.length;
          container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [latestSeries.length]);

  const [brandsAtStart, setBrandsAtStart] = useState(true);
  const [brandsAtEnd, setBrandsAtEnd] = useState(false);

  const handleBrandScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el) return;
    setBrandsAtStart(el.scrollLeft <= 5);
    setBrandsAtEnd(Math.ceil(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 5);
  };

  const handleSeriesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el || latestSeries.length <= 1) return;
    
    setSeriesAtStart(el.scrollLeft <= 10);
    setSeriesAtEnd(Math.ceil(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 10);

    const index = Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth)) * (latestSeries.length - 1));
    setCurrentSeriesIndex(Math.min(Math.max(index, 0), latestSeries.length - 1) || 0);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex flex-wrap gap-3">
                {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">New Arrivals Available</span>
                </div> */}
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Fast Repair Service</span>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Premium Mobile
                <span className="block text-gradient">Experience</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg">
                Discover the latest smartphones from top brands. Expert repairs,
                genuine accessories, and professional service all in one place.
              </p>

              <div className="flex flex-row flex-wrap gap-4">
                <Link href="/brand?mode=service">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2 animate-pulse-glow w-52">
                    Explore Repair Services  
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/booking" className="lg:hidden">
                  <Button size="lg" variant="outline" className="bg-transparent border-gray-400/50 hover:bg-gray-50/80 hover:border-gray-500/70 gap-2 w-52">
                    Book Service Slot
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-12 pt-8">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-muted-foreground text-sm">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-muted-foreground text-sm">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">5★</div>
                  <div className="text-muted-foreground text-sm">Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=700&fit=crop"
                  alt="Featured Phone"
                  className="relative rounded-3xl shadow-2xl shadow-primary/20 mx-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Select Your Device Brand</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Choose your device brand to explore our repair services</p>
          </motion.div>

          {brandsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* MOBILE: Horizontal scroll with arrows */}
              <div className="md:hidden relative">
                <div 
                  id="brand-scroll-container"
                  onScroll={handleBrandScroll}
                  className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth snap-x px-0"
                >
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                  `}</style>
                  {brands.map((brand, index) => (
                    <div key={brand.id} className="flex-shrink-0 w-32 snap-start">
                      <BrandCard brand={brand} index={index} href={`/brand/${brand.id}?mode=service`} />
                    </div>
                  ))}
                </div>
                {!brandsAtStart && (
                  <button
                    onClick={() => { const c = document.getElementById('brand-scroll-container'); if (c) c.scrollBy({ left: -300, behavior: 'smooth' }); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {!brandsAtEnd && (
                  <button
                    onClick={() => { const c = document.getElementById('brand-scroll-container'); if (c) c.scrollBy({ left: 300, behavior: 'smooth' }); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* DESKTOP: Responsive grid, no scroll */}
              <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-6">
                {brands.map((brand, index) => (
                  <BrandCard key={brand.id} brand={brand} index={index} href={`/brand/${brand.id}?mode=service`} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Product Filter Section */}
      <section className="py-12 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <ProductFilterCard options={filterOptions} loading={filterLoading} />
        </div>
      </section>

      {/* Latest Series Section */}
      <section className="py-10 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Series</h2>
              {/* <p className="text-muted-foreground">Discover the newest product lines</p> */}
            </div>
          </motion.div>

          <div className="relative w-full">
            {latestSeries.length > 0 && (
              <>
                {/* MOBILE: Horizontal scroll with arrows */}
                <div className="md:hidden relative pb-6">
                  <div 
                    id="series-scroll-container"
                    onScroll={handleSeriesScroll}
                    className="flex items-stretch overflow-x-auto gap-0 pb-4 scrollbar-hide scroll-smooth snap-x px-0"
                  >
                    <style jsx>{`
                      .scrollbar-hide::-webkit-scrollbar { display: none; }
                      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    {latestSeries.map((series, index) => (
                      <div key={series.id} className="flex-shrink-0 w-full snap-center px-2 h-full">
                        <SeriesCard 
                          series={series} 
                          index={index} 
                          showProducts={false} 
                        />
                      </div>
                    ))}
                  </div>
                  
                  {!seriesAtStart && (
                    <button
                      onClick={() => { const c = document.getElementById('series-scroll-container'); if (c) c.scrollBy({ left: -c.clientWidth, behavior: 'smooth' }); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10 shadow-lg"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  
                  {!seriesAtEnd && (
                    <button
                      onClick={() => { const c = document.getElementById('series-scroll-container'); if (c) c.scrollBy({ left: c.clientWidth, behavior: 'smooth' }); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10 shadow-lg"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}

                  {/* Series Indicators */}
                  <div className="flex justify-center gap-2 mt-2 absolute bottom-0 left-0 right-0">
                    {latestSeries.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSeriesIndex 
                            ? "bg-primary w-8" 
                            : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* DESKTOP: Grid of all series */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                  {latestSeries.map((series, index) => (
                    <SeriesCard
                      key={series.id}
                      series={series}
                      index={index}
                      showProducts={false}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <ServiceInfoCards />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Upgrade?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Visit our store or contact us today. We're here to help you find the perfect device.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2">
                  Contact Us
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact#find-us">
                <Button size="lg" variant="outline" className="border-border">
                  Find Store
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
