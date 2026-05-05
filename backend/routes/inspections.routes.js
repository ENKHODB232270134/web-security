const express = require("express");
const { getInspections, createInspection, updateInspection, deleteInspection } = require("../controllers/inspections.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getInspections);
router.post("/", allowRoles("admin", "security_manager", "shift_supervisor", "security_staff"), createInspection);
router.put("/:id", allowRoles("admin", "security_manager", "shift_supervisor"), updateInspection);
router.delete("/:id", allowRoles("admin", "security_manager", "shift_supervisor"), deleteInspection);

module.exports = router;
