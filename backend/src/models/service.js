const mongoose = require("mongoose");
const serviceConstants = require("../utils/constants/service.constants");

const serviceSchema = new mongoose.Schema(
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
    basePrice: {
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
    level: {
      type: String,
      enum: Object.values(serviceConstants.SERVICE_LEVELS),
      default: serviceConstants.SERVICE_LEVELS.BRAND,
      required: true,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "level",
    },
  },
  {
    timestamps: true,
    collection: "services",
  },
);

module.exports = mongoose.model("Service", serviceSchema);
