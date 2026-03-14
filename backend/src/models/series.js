const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
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
    collection: "series",
  },
);

seriesSchema.index({ categoryId: 1 });
seriesSchema.index({ isActive: 1 });
seriesSchema.index({ createdAt: -1 });
seriesSchema.index({ categoryId: 1, isActive: 1 });
seriesSchema.index({ categoryId: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Series", seriesSchema);
