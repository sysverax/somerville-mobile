"use client";
import { use } from "react";  
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  getStorefrontCategoryById,
  getStorefrontSeriesByCategory,
  getStorefrontBrandById,
} from "@/src/services";
import Layout from "@/src/components/layout/Layout";
import SeriesCard from "@/src/components/cards/SeriesCard";

type Props = {
  params: Promise<{ id: string }>;  
};

const CategoryPage = ({ params }: Props) => {
  const { id: categoryId } = use(params); 
  const category = getStorefrontCategoryById(categoryId || "");
  const seriesList = getStorefrontSeriesByCategory(categoryId || "");
  const brand = category ? getStorefrontBrandById(category.brandId) : null;

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
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
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/80" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
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
            <span className="text-foreground">{category.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{category.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Series */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-8"
          >
            Product Series
          </motion.h2>

          {seriesList.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seriesList.map((s, index) => (
                <SeriesCard key={s.id} series={s} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No series found in this category</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
