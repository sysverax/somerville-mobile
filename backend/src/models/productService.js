const mongoose = require("mongoose");

const productServiceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "product_services",
  },
);

productServiceSchema.index({ serviceId: 1 });
productServiceSchema.index({ productId: 1 });
productServiceSchema.index({ serviceId: 1, productId: 1 });
productServiceSchema.index({ serviceId: 1, isDefault: 1 });
productServiceSchema.index({ serviceId: 1, isDefault: 1, isActive: 1 });

module.exports = mongoose.model("ProductService", productServiceSchema);
