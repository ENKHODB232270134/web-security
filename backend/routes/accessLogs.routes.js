const express = require("express");
const { getAccessLogs, createAccessLog, updateAccessLog, deleteAccessLog } = require("../controllers/accessLogs.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getAccessLogs);
router.post("/", allowRoles("admin", "security_manager", "shift_supervisor", "security_staff"), createAccessLog);
router.put("/:id", allowRoles("admin", "security_manager", "shift_supervisor", "security_staff"), updateAccessLog);
router.delete("/:id", allowRoles("admin", "security_manager", "shift_supervisor"), deleteAccessLog);

module.exports = router;
