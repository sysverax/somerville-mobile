"use client";

import Link from "next/link";         
import Image from "next/image";
import { motion } from "framer-motion";
import type { StorefrontBrand } from "@/src/services";

interface BrandCardProps {
  brand: StorefrontBrand;
  index?: number;
}

const BrandCard = ({ brand, index = 0 }: BrandCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/brand/${brand.id}`}
        className="group block p-6 rounded-2xl bg-gradient-card shadow-card glass-hover text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-secondary/50 flex items-center justify-center">
          <Image
            src={brand.logo}      
            alt={brand.name}
            width={80}
            height={80}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
          {brand.name}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          {brand.description}
        </p>
      </Link>
    </motion.div>
  );
};

export default BrandCard;
