"use client";
import { use } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  getStorefrontSeriesById,
  getStorefrontProductsBySeries,
  getStorefrontCategoryById,
  getStorefrontBrandById,
} from "@/src/services";
import Layout from "@/src/components/layout/Layout";
import ProductCard from "@/src/components/cards/ProductCard";

type Props = {
  params: Promise<{ id: string }>;
};

const SeriesPage = ({ params }: Props) => {
  const { id: seriesId } = use(params);
  const series = getStorefrontSeriesById(seriesId || "");
  const products = getStorefrontProductsBySeries(seriesId || "");
  const category = series ? getStorefrontCategoryById(series.categoryId) : null;
  const brand = category ? getStorefrontBrandById(category.brandId) : null;

  if (!series) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Series not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={series.banner}
            alt={series.name}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/80" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            {brand && (
              <>
                <Link href={`/brand/${brand.id}`} className="hover:text-foreground transition-colors">
                  {brand.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            {category && (
              <>
                <Link href={`/category/${category.id}`} className="hover:text-foreground transition-colors">
                  {category.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-foreground">{series.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">{series.releaseYear}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{series.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{series.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-2xl font-bold">
              Products ({products.length})
            </h2>
          </motion.div>

          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found in this series</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SeriesPage;
