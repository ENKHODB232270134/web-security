const express = require("express");
const { getVisitors, createVisitor, updateVisitor, deleteVisitor } = require("../controllers/visitors.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getVisitors);
router.post("/", allowRoles("admin", "security_manager", "shift_supervisor", "security_staff"), createVisitor);
router.put("/:id", allowRoles("admin", "security_manager", "shift_supervisor", "security_staff"), updateVisitor);
router.delete("/:id", allowRoles("admin", "security_manager", "shift_supervisor"), deleteVisitor);

module.exports = router;
