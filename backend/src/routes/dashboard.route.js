const express = require("express");
const router = express.Router();

const { validateAdmin } = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get("/", validateAdmin, dashboardController.getDashboardStats);

module.exports = router;
