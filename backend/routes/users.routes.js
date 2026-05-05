const express = require("express");
const { getUsers, createUser, getOptions } = require("../controllers/users.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.get("/options", getOptions);
router.get("/", allowRoles("admin", "security_manager", "shift_supervisor"), getUsers);
router.post("/", allowRoles("admin"), createUser);

module.exports = router;
