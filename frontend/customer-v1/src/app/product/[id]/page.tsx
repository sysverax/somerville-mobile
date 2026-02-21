"use client";
import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Share2, Truck, Shield, RotateCcw, Package, Wrench, Clock, Calendar, DollarSign, Sparkles, RefreshCw } from "lucide-react";
import {
  getStorefrontProductById,
  getStorefrontSeriesById,
  getStorefrontCategoryById,
  getStorefrontBrandById,
  getStorefrontServicesByProduct,
  type StockCondition,
} from "@/src/services";
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
  const product = getStorefrontProductById(productId || "");
  const series = product ? getStorefrontSeriesById(product.seriesId) : null;
  const category = series ? getStorefrontCategoryById(series.categoryId) : null;
  const brand = category ? getStorefrontBrandById(category.brandId) : null;
  const services = product ? getStorefrontServicesByProduct(product.id) : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [activeTab, setActiveTab] = useState<"stock" | "services">("services");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<StockCondition>("new");

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </Layout>
    );
  }

  const getConditionStock = () => {
    if (product?.stockOptions) {
      return product.stockOptions.find(s => s.condition === selectedCondition);
    }
    return null;
  };

  const conditionStock = getConditionStock();
  const currentPrice = conditionStock?.price || selectedVariant?.price || product.price;
  const currentOriginalPrice = conditionStock?.originalPrice || product.originalPrice;
  const isInStock = conditionStock ? conditionStock.inStock : product.stock > 0;

  const handleBookService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setBookingDialogOpen(true);
  };

  return (
    <Layout>
      {/* TODO: If need shop now please uncomment the following section */}
      {/* Top Switcher Bar */}
      {/* <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            <button
              onClick={() => setActiveTab("stock")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "stock"
                ? "bg-gradient-primary text-primary-foreground shadow-lg"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Stock & Price</span>
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "services"
                ? "bg-gradient-primary text-primary-foreground shadow-lg"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Services</span>
              {services.length > 0 && (
                <Badge
                  variant="secondary"
                  className={`ml-1 text-xs ${activeTab === "services"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/20 text-primary"
                    }`}
                >
                  {services.length}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div> */}

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

        {/* Stock & Price View */}
        {activeTab === "stock" && (
          <motion.div
            key="stock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              {/* Images */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="relative aspect-square rounded-2xl bg-gradient-card overflow-hidden border border-border/50">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-border"
                          }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-contain p-2 bg-secondary"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-primary font-medium mb-2">{brand?.name}</p>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                {/* Condition Tabs */}
                {product.stockOptions && product.stockOptions.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Condition</label>
                    <div className="flex gap-3">
                      {product.stockOptions.map((option) => (
                        <button
                          key={option.condition}
                          onClick={() => setSelectedCondition(option.condition)}
                          className={`flex-1 px-4 py-4 rounded-xl border-2 transition-all ${selectedCondition === option.condition
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {option.condition === "new" ? (
                              <Sparkles className="h-5 w-5 text-primary" />
                            ) : (
                              <RefreshCw className="h-5 w-5 text-primary" />
                            )}
                            <span className="font-semibold capitalize">{option.condition === "new" ? "Brand New" : "Refurbished"}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xl font-bold">${option.price}</span>
                          </div>
                          <div className="mt-2">
                            {option.inStock ? (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold">${currentPrice}</span>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {isInStock ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-success font-medium">
                        {selectedCondition === "new" ? "Brand New" : "Refurbished"} - In Stock
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-destructive font-medium">
                        {selectedCondition === "new" ? "Brand New" : "Refurbished"} - Out of Stock
                      </span>
                    </>
                  )}
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Select Variant</label>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${selectedVariant?.id === variant.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="text-sm font-medium">{variant.name}</div>
                          <div className="text-xs text-muted-foreground">${variant.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
                    onClick={() => setActiveTab("services")}
                  >
                    View Available Services
                  </Button>
                  <Button size="lg" variant="outline" className="border-border">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div className="text-center">
                    <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over $99</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Warranty</p>
                    <p className="text-xs text-muted-foreground">1 Year Included</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30 Day Policy</p>
                  </div>
                </div>

                {/* Services Preview */}
                {services.length > 0 && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        <span className="font-medium">{services.length} services available</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("services")}
                        className="text-primary"
                      >
                        View Services →
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Specifications Section */}
            <div className="mt-8">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start bg-card/50 border border-border rounded-xl p-1 h-auto mb-8">
                  <TabsTrigger
                    value="details"
                    className="flex items-center gap-2 rounded-lg px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Package className="h-4 w-4" />
                    Specifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold mb-4">Specifications</h3>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
                        >
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold mb-4">Product Information</h3>
                      <div className="p-6 rounded-xl bg-gradient-card border border-border space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">SKU</span>
                          <span className="font-mono font-medium">{product.sku}</span>
                        </div>
                        {product.variants && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Variants</span>
                            <span className="font-medium">{product.variants.length} options</span>
                          </div>
                        )}
                        {series && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Series</span>
                            <Link href={`/series/${series.id}`} className="font-medium text-primary hover:underline">
                              {series.name}
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Contact for Purchase */}
                      <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                        <h4 className="font-bold text-lg">Interested in Purchasing?</h4>
                        <p className="text-sm text-muted-foreground">
                          Contact us to purchase your {product.name}. Price: <span className="font-bold text-primary">${currentPrice}</span>
                        </p>
                        <Button
                          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2"
                          onClick={() => setActiveTab("services")}
                        >
                          <Wrench className="h-4 w-4" />
                          Book a Service
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}

        {/* Services View */}
        {activeTab === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gradient-card border border-border">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-16 h-16 object-contain rounded-lg bg-secondary p-2"
              />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{brand?.name}</p>
                <h2 className="font-bold">{product.name}</h2>
              </div>
              {/* TODO: If need shop now please uncomment the following section */}
              {/* <Button
                variant="outline"
                onClick={() => setActiveTab("stock")}
                className="hidden sm:flex"
              >
                View Product Details
              </Button> */}
            </div>

            {services.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Available Services</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Professional repair and support services for your {product.name}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-6 rounded-xl bg-gradient-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg">{service.name}</h4>
                            {service.isAvailable ? (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{service.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-primary">${service.price}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2"
                          disabled={!service.isAvailable}
                          onClick={() => handleBookService(service.id)}
                        >
                          <Calendar className="h-4 w-4" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No Services Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  There are currently no repair or support services available for this product.
                  Please check back later or contact us for assistance.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Book Service
            </DialogTitle>
          </DialogHeader>
          <BookingForm
            preSelectedBrandId={brand?.id}
            preSelectedProductId={product.id}
            preSelectedCategoryId={category?.id} 
            preSelectedSeriesId={series?.id}     
            preSelectedServiceId={selectedServiceId || undefined}
            onSuccess={() => setBookingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetailPage;
