const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "categories",
  },
);

// Define indexes for the categories collection
categorySchema.index({ brandId: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ createdAt: -1 });
categorySchema.index({ brandId: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Category", categorySchema);
