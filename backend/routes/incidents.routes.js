const express = require("express");
const {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
} = require("../controllers/incidents.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getIncidents);
router.post("/", allowRoles("admin", "security_manager", "shift_supervisor", "security_staff"), createIncident);
router.put("/:id", allowRoles("admin", "security_manager", "shift_supervisor", "security_staff"), updateIncident);
router.delete("/:id", allowRoles("admin", "security_manager", "shift_supervisor"), deleteIncident);

module.exports = router;
