"use client";

import Link from "next/link";         
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { StorefrontCategory } from "@/src/services";

interface CategoryCardProps {
  category: StorefrontCategory;
  index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <motion.div>
      <Link
        href={`/category/${category.id}`}
        className="group block relative overflow-hidden rounded-xl bg-gradient-card shadow-card h-40"
      >
        <div className="absolute inset-0">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent" />
        </div>

        <div className="relative h-full p-6 flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
            {category.description}
          </p>
          <div className="flex items-center text-primary font-medium text-sm">
            <span>Explore</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
