const express = require("express");
const router = express.Router();

const { validateAdmin } = require("../middlewares/auth.middleware");
const filterController = require("../controllers/filter.controller");

router.get("/options", validateAdmin, filterController.getFilterOptionsController);

module.exports = router;
