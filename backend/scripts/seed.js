require("dotenv").config();
const mongoose = require("mongoose");

// Make sure these paths match your actual model locations
const Brand = require("../src/models/brand");
const Category = require("../src/models/category");
const Series = require("../src/models/series");
const Product = require("../src/models/product");
const Service = require("../src/models/service");
const ProductService = require("../src/models/productService");

const seedHierarchy = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is not defined in the environment.");
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // 1. Create Brand
    const brand = await Brand.create({
      name: "Test Brand",
      description: "A dynamically generated brand for testing",
      isActive: true,
      iconImageUrl: "apple.png",
      bannerImageUrl: "apple.png"
    });
    console.log(`Created Brand: ${brand.name} [${brand._id}]`);

    // 2. Create Category
    const category = await Category.create({
      name: "Test Category",
      iconImageUrl: "apple.png",
      description: "A dynamically generated category",
      brandId: brand._id,
      isActive: true,
    });
    console.log(`Created Category: ${category.name} [${category._id}]`);

    // 3. Create Series
    const series = await Series.create({
      name: "Test Series",
       iconImageUrl: "apple.png",
      description: "A dynamically generated series",
      categoryId: category._id,
      isActive: true,
    });
    console.log(`Created Series: ${series.name} [${series._id}]`);

    // 4. Create Product
    const product = await Product.create({
      name: "Test Product",
       iconImageUrl: "apple.png",
      description: "A dynamically generated product",
      seriesId: series._id,
      isActive: true,
    });
    console.log(`Created Product: ${product.name} [${product._id}]`);

    // 5. Create a Base Service (mapped to the Brand level, for example)
    const service = await Service.create({
      name: "Seed Installation Service",
      description: "Installation Service mapped to the Brand",
      level: "brand",
      levelId: brand._id,
      estimatedTime: 120,
      basePrice: 150,
      isActive: true,
      isParent: false,
      isVariant: false,
    });
    console.log(`Created Service: ${service.name} [${service._id}]`);

    // 6. Map the Service to the specific Product (ProductService)
    const productService = await ProductService.create({
      productId: product._id,
      serviceId: service._id,
      price: 150, // Usually overridden specifically for the product
      estimatedTime: 120,
      isDefault: true,
      isActive: true,
    });
    console.log(`Created ProductService mapping: [${productService._id}]`);

    console.log("\nSeeding Completed Successfully!");
  } catch (error) {
    console.error("Error occurred while seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

seedHierarchy();
