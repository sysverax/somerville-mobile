const express = require("express");
const router = express.Router();

const { validateRoleBasedHeader } = require("../middlewares/auth.middleware");
const filterController = require("../controllers/filter.controller");

router.get("/options", validateRoleBasedHeader, filterController.getFilterOptionsController);

module.exports = router;
