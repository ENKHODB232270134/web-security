const express = require("express");
const { getAuditLogs } = require("../controllers/audit.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/", allowRoles("admin", "security_manager"), getAuditLogs);

module.exports = router;
