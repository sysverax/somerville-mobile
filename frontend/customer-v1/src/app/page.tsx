"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  getStorefrontBrands,
  getStorefrontLatestSeries,
  getStorefrontFeaturedProducts,
} from "@/src/services";
import BrandCard from "@/src/components/cards/BrandCard";
import SeriesCard from "@/src/components/cards/SeriesCard";
import ProductCard from "@/src/components/cards/ProductCard";
import Layout from "@/src/components/layout/Layout";
import ProductFilterCard from "@/src/components/home/ProductFilterCard";
import ServiceInfoCards from "@/src/components/home/ServiceInfoCards";

const Index = () => {
  const brands = getStorefrontBrands();
  const latestSeries = getStorefrontLatestSeries();
  const featuredProducts = getStorefrontFeaturedProducts();

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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">New Arrivals Available</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Premium Mobile
                <span className="block text-gradient">Experience</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg">
                Discover the latest smartphones from top brands. Expert repairs,
                genuine accessories, and professional service all in one place.
              </p>

              <div className="flex flex-wrap gap-4">
                {/* TODO: If need shop now please uncomment the following section */}
                {/*Shop feature */}
                {/* <Link href="/brand?mode=shop">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2 animate-pulse-glow">
                    Shop Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link> */}
                <Link href="/brand?mode=service">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2 animate-pulse-glow">
                    Repair Service
                    <ArrowRight className="h-5 w-5" />
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
            {/* TODO: If need shop now please uncomment the following section and remove service related h2 and p*/}
            {/* Shop feature */}
            {/* <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Brand</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated selection of premium mobile devices from the world's leading brands
            </p> */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Select Your Device Brand</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Choose your device brand to explore our repair services</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {brands.map((brand, index) => (
              <BrandCard key={brand.id} brand={brand} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Product Filter Section */}
      <section className="py-12 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <ProductFilterCard />
        </div>
      </section>

      {/* Latest Series Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Series</h2>
              <p className="text-muted-foreground">Discover the newest product lines</p>
            </div>
            {/* <Button variant="outline" className="hidden md:flex gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button> */}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestSeries.slice(0, 3).map((s, index) => (
              <SeriesCard key={s.id} series={s} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* TODO: If need shop now please uncomment the following section */}
      {/* TODO: Featured Products Section */}
      {/* <section className="py-20 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked devices for you</p>
            </div>
            <Button variant="outline" className="hidden md:flex gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section> */}

      {/* TODO: If need shop now please change classname as py-20 */}
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
              <Link href="/contact">
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
