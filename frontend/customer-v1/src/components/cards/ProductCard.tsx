"use client"; 

import Link from "next/link";       
import { motion } from "framer-motion";
import { Check, X, Wrench, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { getStorefrontMinServicePrice, getStorefrontServiceCount, type StorefrontProduct } from "@/src/services";
import { Badge } from "@/src/components/ui/badge";

interface ProductCardProps {
  product: StorefrontProduct;
  index?: number;
  showServices?: boolean;
}

const ProductCard = ({ product, index = 0, showServices = true }: ProductCardProps) => {
  const minServicePrice = getStorefrontMinServicePrice(product.id);
  const serviceCount = getStorefrontServiceCount(product.id);

  const hasNewStock = product.stockOptions?.some(s => s.condition === "new" && s.inStock);
  const hasRefurbished = product.stockOptions?.some(s => s.condition === "refurbished");
  const hasRefurbishedStock = product.stockOptions?.some(s => s.condition === "refurbished" && s.inStock);
  const refurbishedPrice = product.stockOptions?.find(s => s.condition === "refurbished")?.price;
  const newPrice = product.stockOptions?.find(s => s.condition === "new")?.price || product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/product/${product.id}`}
        className="group block relative overflow-hidden rounded-2xl bg-gradient-card shadow-card glass-hover"
      >
        {/* TODO: If need shop now please uncomment the following section */}
        {/*Product feature */}
        {/* {product.stockOptions && product.stockOptions.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {hasNewStock && (
              <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                New
              </Badge>
            )}
            {hasRefurbished && (
              <Badge 
                variant="secondary" 
                className={`text-xs gap-1 ${hasRefurbishedStock ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                <RefreshCw className="h-3 w-3" />
                Refurbished {refurbishedPrice && `$${refurbishedPrice}`}
              </Badge>
            )}
          </div>
        )} */}

        <div className="relative h-56 p-6 flex items-center justify-center bg-secondary/20">
          <img
            src={product.images[0]}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-6 space-y-3">
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          {/* TODO: If need shop now please uncomment the following section */}
          {/*Product feature */}
          {/* <p className="text-muted-foreground text-sm line-clamp-2">
            {product.description}
          </p>

          {hasRefurbished && refurbishedPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">${refurbishedPrice}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-lg font-bold">${newPrice}</span>
            </div>
          ) : (
            <div className="text-lg font-bold">${newPrice}</div>
          )}

          <div className="flex items-center gap-2">
            {(hasNewStock || hasRefurbishedStock || product.stock > 0) ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm text-success">Available for purchase & service</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Out of Stock</span>
              </>
            )}
          </div> */}

          {showServices && serviceCount > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {serviceCount} services available
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
