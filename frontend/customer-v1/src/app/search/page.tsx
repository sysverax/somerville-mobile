"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { storefrontSearchProducts } from "@/src/services";
import Layout from "@/src/components/layout/Layout";
import ProductCard from "@/src/components/cards/ProductCard";

function SearchForm() {
  const searchParams = useSearchParams(); 
  const query = searchParams?.get("q") || "";
  const results = storefrontSearchProducts(query);

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <Search className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Search Results
              </h1>
            </div>
            <p className="text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </p>
          </motion.div>

          {results.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10">Loading...</div>}>
      <SearchForm />
    </Suspense>
  );
}