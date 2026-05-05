const express = require("express");
const { getEmployees, createEmployee } = require("../controllers/employees.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getEmployees);
router.post("/", allowRoles("admin", "security_manager"), createEmployee);

module.exports = router;
