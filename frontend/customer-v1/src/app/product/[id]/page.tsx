"use client";
import { use, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Share2, Truck, Shield, RotateCcw, Package, Wrench, Clock, Calendar, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  getStorefrontProductById,
  getStorefrontSeriesById,
  getStorefrontCategoryById,
  getStorefrontBrandById,
  getStorefrontServicesByProduct,
  type StorefrontBrand,
  type StorefrontCategory,
  type StorefrontSeries,
  type StorefrontProduct,
  type StockCondition,
  type StorefrontService,
} from "@/src/services";
import { useEffect } from "react";
import Layout from "@/src/components/layout/Layout";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import BookingForm from "@/src/components/booking/BookingForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type Props = {
  params: Promise<{ id: string }>;
};

const ProductDetailPage = ({ params }: Props) => {
  const { id: productId } = use(params);
  
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [series, setSeries] = useState<StorefrontSeries | null>(null);
  const [category, setCategory] = useState<StorefrontCategory | null>(null);
  const [brand, setBrand] = useState<StorefrontBrand | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [services, setServices] = useState<StorefrontService[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"stock" | "services">("services");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedParentServiceId, setSelectedParentServiceId] = useState<string | null>(null);
  const [selectedServicePrice, setSelectedServicePrice] = useState<number | null>(null);
  const [selectedServiceEstimatedTime, setSelectedServiceEstimatedTime] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<StockCondition>("new");
  const [selectedVariantsByParent, setSelectedVariantsByParent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    const fetchData = async () => {
      try {
        const prod = await getStorefrontProductById(productId);
        setProduct(prod || null);
        
        if (prod) {
          // Fetch services and series in parallel
          const [svcs, s] = await Promise.all([
            getStorefrontServicesByProduct(prod.id),
            getStorefrontSeriesById(prod.seriesId)
          ]);
          
          setServices(svcs);
          setSeries(s || null);
          if (prod.variants?.[0]) setSelectedVariant(prod.variants[0]);
          
          if (s) {
            // Fetch category and its brand in parallel or sequence as needed
            const cat = await getStorefrontCategoryById(s.categoryId);
            setCategory(cat || null);
            
            if (cat) {
              const b = await getStorefrontBrandById(cat.brandId);
              setBrand(b || null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const groupedServices = useMemo(() => {
    const nonVariants = services.filter(service => !service.isVariant);
    const variants = services.filter(service => service.isVariant);

    const variantMap = new Map<string, StorefrontService[]>();
    variants.forEach(variant => {
      if (!variant.parentServiceId) return;
      const existing = variantMap.get(variant.parentServiceId) || [];
      variantMap.set(variant.parentServiceId, [...existing, variant]);
    });

    const groups: Array<
      | { type: "single"; service: StorefrontService }
      | { type: "parent"; parent: StorefrontService; variants: StorefrontService[] }
    > = [];

    nonVariants.forEach(service => {
      const serviceVariants = variantMap.get(service.serviceId) || [];
      if (serviceVariants.length > 0) {
        groups.push({ type: "parent", parent: service, variants: serviceVariants });
      } else {
        groups.push({ type: "single", service });
      }
    });

    return groups;
  }, [services]);

  const handleBookService = (service: StorefrontService, parentServiceId: string | null = null) => {
    setSelectedServiceId(service.id);
    setSelectedParentServiceId(parentServiceId);
    setSelectedServicePrice(service.price);
    setSelectedServiceEstimatedTime(service.estimatedTime);
    setBookingDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-dark">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </Layout>
    );
  }

  const conditionStock = product.stockOptions?.find(s => s.condition === selectedCondition);
  const currentPrice = conditionStock?.price || selectedVariant?.price || product.price;
  const isInStock = conditionStock ? conditionStock.inStock : product.stock > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
          {series && (
            <>
              <Link href={`/series/${series.id}`} className="hover:text-foreground transition-colors">
                {series.name}
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </nav>

        {activeTab === "stock" && (
          <motion.div key="stock" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl bg-gradient-card overflow-hidden border border-border/50">
                  <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-contain p-8" />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((image, index) => (
                      <button key={index} onClick={() => setSelectedImage(index)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-primary" : "border-border"}`}>
                        <img src={image} alt={`Preview ${index}`} className="w-full h-full object-contain p-2 bg-secondary" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-primary font-medium mb-2">{brand?.name}</p>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold">${currentPrice}</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${isInStock ? 'bg-success' : 'bg-destructive'}`} />
                   <span className={`${isInStock ? 'text-success' : 'text-destructive'} font-medium`}>
                     {isInStock ? 'In Stock' : 'Out of Stock'}
                   </span>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button size="lg" className="flex-1 bg-gradient-primary" onClick={() => setActiveTab("services")}>
                    View Available Services
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "services" && (
          <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gradient-card border border-border">
              <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-contain rounded-lg bg-secondary p-2" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{brand?.name}</p>
                <h2 className="font-bold">{product.name}</h2>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Available Services</h3>
                <div className="columns-1 md:columns-2 [column-gap:24px]">
                  {groupedServices.map((group) => {
                    if (group.type === "single") {
                      return (
                        <div key={group.service.id} className="inline-block w-full mb-6 break-inside-avoid p-6 rounded-xl bg-gradient-card border border-border">
                          <h4 className="font-bold text-lg mb-2">{group.service.name}</h4>
                          <p className="text-muted-foreground text-sm mb-4">{group.service.description}</p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-primary">${group.service.price}</span>
                            <span className="text-sm text-muted-foreground">{group.service.duration}</span>
                          </div>
                          <Button className="w-full bg-gradient-primary" onClick={() => handleBookService(group.service)}>
                            Book Now
                          </Button>
                        </div>
                      );
                    }
                    return (
                      <div key={group.parent.id} className="inline-block w-full mb-6 break-inside-avoid p-6 rounded-xl bg-gradient-card border border-border">
                        <h4 className="font-bold text-lg mb-2">{group.parent.name}</h4>
                        <p className="text-muted-foreground text-sm mb-4">{group.parent.description}</p>
                        <div className="space-y-3 mb-4">
                          {group.variants.map(variant => (
                            <button
                              key={variant.id}
                              onClick={() => setSelectedVariantsByParent(prev => ({ ...prev, [group.parent.serviceId]: variant.id }))}
                              className={`w-full text-left rounded-lg border p-3 transition-all ${selectedVariantsByParent[group.parent.serviceId] === variant.id ? "border-primary bg-primary/10" : "border-border"}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{variant.name.replace(group.parent.name + " - ", "")}</span>
                                <span className="font-bold text-primary">${variant.price}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Button
                          className="w-full bg-gradient-primary"
                          disabled={!selectedVariantsByParent[group.parent.serviceId]}
                          onClick={() => {
                            const variant = group.variants.find(v => v.id === selectedVariantsByParent[group.parent.serviceId]);
                            if (variant) handleBookService(variant, group.parent.serviceId);
                          }}
                        >
                          Book Now
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No Services Available</h3>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book a Service</DialogTitle>
          </DialogHeader>
          {bookingDialogOpen && (
            <BookingForm
              preSelectedBrandId={brand?.id}
              preSelectedProductId={product.id}
              preSelectedCategoryId={category?.id}
              preSelectedSeriesId={series?.id}
              preSelectedServiceId={selectedServiceId || undefined}
              preSelectedParentServiceId={selectedParentServiceId}
              preSelectedPrice={selectedServicePrice || undefined}
              preSelectedEstimatedTime={selectedServiceEstimatedTime || undefined}
              onSuccess={() => setBookingDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetailPage;
