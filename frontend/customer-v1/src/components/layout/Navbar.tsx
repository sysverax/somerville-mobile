"use client"; 

import { useState } from "react";
import Link from "next/link";       
import Image from "next/image";      
import { useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, Calendar, Info, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStorefrontBrands, getStorefrontCategoriesByBrand } from "@/src/services";
import logo from "@/public/logo.jpeg";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

const Navbar = () => {
  const brands = getStorefrontBrands();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [mobileExpandedBrand, setMobileExpandedBrand] = useState<string | null>(null);
const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveBrand(null);
    setIsOpen(false);
    router.push(`/category/${categoryId}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src={logo} alt="Somerville Mobile" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-bold text-base hidden xl:block whitespace-nowrap">
              Somerville<span className="text-primary">Mobile</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {brands.map((brand) => {
              const brandCategories = getStorefrontCategoriesByBrand(brand.id);
              return (
                <div
                  key={brand.id}
                  className="relative"
                  onMouseEnter={() => setActiveBrand(brand.id)}
                  onMouseLeave={() => setActiveBrand(null)}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeBrand === brand.id 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {brand.name}
                    {brandCategories.length > 0 && (
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        activeBrand === brand.id ? "rotate-180" : ""
                      }`} />
                    )}
                  </button>

                  <AnimatePresence>
                    {activeBrand === brand.id && brandCategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 pt-2 min-w-[220px]"
                      >
                        <div className="bg-card/95 backdrop-blur-xl rounded-xl border border-border shadow-xl p-2">
                          {brandCategories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors group text-left"
                            >
                              <div className="w-10 h-10  flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {category.name}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {category.description}
                                </p>
                              </div>
                            </button>
                          ))}
                          <Link
                            href={`/brand/${brand.id}`}
                            onClick={() => setActiveBrand(null)}
                            className="block w-full text-center text-sm text-primary font-medium px-4 py-2 mt-2 rounded-lg hover:bg-primary/10 transition-colors border-t border-border whitespace-nowrap"
                          >
                            View All {brand.name} →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/about">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden lg:flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">About Us</span>
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden lg:flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Contact</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/booking" className="hidden sm:block">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4">
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSearch} className="py-4">
                <div className="relative mx-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products, series, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 bg-secondary border-border focus:border-primary"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-border/50 max-h-[70vh] overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              <Link
                href="/booking"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-primary-foreground bg-primary rounded-lg mb-3"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Now</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
              >
                <Info className="h-4 w-4" />
                <span>About Us</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg mb-2"
              >
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </Link>
              
              {brands.map((brand) => {
                const brandCategories = getStorefrontCategoriesByBrand(brand.id);
                const isExpanded = mobileExpandedBrand === brand.id;
                
                return (
                  <div key={brand.id} className="border-b border-border/30 last:border-0">
                    <button
                      onClick={() => setMobileExpandedBrand(isExpanded ? null : brand.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
                    >
                      <span>{brand.name}</span>
                      {brandCategories.length > 0 && (
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`} />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && brandCategories.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 pb-2 space-y-1">
                            {brandCategories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 rounded-lg transition-colors"
                              >
                                <div className="w-8 h-8 rounded-md overflow-hidden bg-secondary">
                                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                </div>
                                <span>{category.name}</span>
                              </button>
                            ))}
                            <Link
                              href={`/brand/${brand.id}`}
                              onClick={() => setIsOpen(false)}
                              className="block text-sm text-primary font-medium px-4 py-2 hover:underline"
                            >
                              View All {brand.name} →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
