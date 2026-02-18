"use client";

import Link from "next/link";         
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getStorefrontProductsBySeries, type StorefrontSeries } from "@/src/services";

interface SeriesCardProps {
  series: StorefrontSeries;
  index?: number;
  showProducts?: boolean;
}

const SeriesCard = ({ series, index = 0, showProducts = true }: SeriesCardProps) => {
  const products = getStorefrontProductsBySeries(series.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-card shadow-card border border-border/50">
        <div className="relative h-44 overflow-hidden">
          <img
            src={series.banner}
            alt={series.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="text-xs font-medium text-primary bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/20">
              {series.releaseYear}
            </span>
          </div>
        </div>

        <div className="p-5">
          <Link href={`/series/${series.id}`}>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {series.name}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {series.description}
          </p>

          {showProducts && products.length > 0 && (
            <div className="space-y-2 mb-4 border-t border-border/50 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Products in this series
              </p>
              <div className="space-y-1">
                {products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors group/product"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-secondary">
                        <Image 
                          src={product.images[0]} 
                          alt={product.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium group-hover/product:text-primary transition-colors">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.stock > 0 ? (
                        <span className="w-2 h-2 rounded-full bg-success" title="Available" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-destructive" title="Out of Stock" />
                      )}
                    </div>
                  </Link>
                ))}
                {products.length > 4 && (
                  <p className="text-xs text-muted-foreground px-3 py-1">
                    +{products.length - 4} more products
                  </p>
                )}
              </div>
            </div>
          )}

          <Link 
            href={`/series/${series.id}`}
            className="flex items-center text-primary font-medium text-sm hover:underline"
          >
            <span>View All Products</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-primary/5" />
        </div>
      </div>
    </motion.div>
  );
};

export default SeriesCard;
