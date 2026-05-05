const express = require("express");
const {
  getNotifications,
  createNotification,
  markNotificationRead,
} = require("../controllers/notifications.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getNotifications);
router.post("/", allowRoles("admin", "security_manager", "shift_supervisor"), createNotification);
router.put("/:id/read", markNotificationRead);

module.exports = router;
