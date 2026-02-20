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
    basePrice: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "product_services",
  },
);

module.exports = mongoose.model("ProductService", productServiceSchema);
