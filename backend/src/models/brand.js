const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    iconImageUrl: {
      type: String,
      default: null,
    },
    bannerImageUrl: {
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
    collection: "brands",
  },
);

brandSchema.index({ isActive: 1 });
brandSchema.index({ _id: 1, isActive: 1 }); 

module.exports = mongoose.model("Brand", brandSchema);
