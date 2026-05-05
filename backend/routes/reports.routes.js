const express = require("express");
const { getReports, createReport } = require("../controllers/reports.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getReports);
router.post("/", createReport);

module.exports = router;
