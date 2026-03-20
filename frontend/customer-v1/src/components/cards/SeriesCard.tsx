"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";         
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getStorefrontProductsBySeries, type StorefrontSeries, type StorefrontProduct } from "@/src/services";

interface SeriesCardProps {
  series: StorefrontSeries;
  index?: number;
  showProducts?: boolean;
  fullHeight?: boolean;
}

const SeriesCard = ({ 
  series, 
  index = 0, 
  showProducts = true,
  fullHeight = true 
}: SeriesCardProps) => {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    getStorefrontProductsBySeries(series.id).then(setProducts);
  }, [series.id]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [series.description]);

  return (
    <div className={`group ${fullHeight ? 'h-full' : ''}`}>
      <div className={`relative ${fullHeight ? 'h-full' : ''} flex flex-col rounded-2xl bg-gradient-card shadow-card border border-border/50`}>
        <div className="relative h-44 overflow-hidden rounded-t-2xl">
          <img
            src={series.banner}
            alt={series.name}
            className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
          />
        </div>

        <div className="p-5 flex flex-col flex-1">
          <Link href={`/series/${series.id}`}>
            <h3 className="text-xl font-bold mb-2 md:group-hover:text-primary transition-colors">
              {series.name}
            </h3>
          </Link>
          <div
            className="relative"
            onMouseEnter={() => isTruncated && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <p ref={descRef} className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
              {series.description || " "}
            </p>
            {showTooltip && (
              <div className="absolute top-full left-0 mt-0 w-80 bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg border border-border z-50 whitespace-normal">
                {series.description}
              </div>
            )}
          </div>

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
                          src={product.images[0] || '/mock-images/default/placeholder.png'} 
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

          {products.length > 0 && (
            <Link 
              href={`/series/${series.id}`}
              className="flex items-center text-primary font-medium text-sm hover:underline"
            >
              <span>View All Products</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform md:group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
          <div className="absolute inset-0 bg-primary/5 rounded-2xl" />
        </div>
      </div>
    </div>

  );
};

export default SeriesCard;
