const mongoose = require("mongoose");

const userConstants = require("../utils/constants/user.constants");

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: [userConstants.USER_ROLES.ADMIN],
      default: userConstants.USER_ROLES.ADMIN,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(userConstants.ADMIN_STATUS),
      required: true,
      default: userConstants.ADMIN_STATUS.ACTIVE,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "admins",
  },
);

adminSchema.set("toJSON", { virtuals: true });
adminSchema.set("toObject", { virtuals: true });

const AdminModel = mongoose.model("Admin", adminSchema);

module.exports = { AdminModel };
