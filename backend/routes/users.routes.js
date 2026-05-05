const express = require("express");
const path = require("path");
const multer = require("multer");
const {
  getUsers,
  createUser,
  getOptions,
  getMe,
  updateMe,
  updateMyPassword,
  uploadMyAvatar,
} = require("../controllers/users.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

const router = express.Router();
const avatarDir = path.join(__dirname, "..", "uploads", "avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${req.user._id}-${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(file.mimetype) || ![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      return cb(new Error("Зөвхөн jpg, jpeg, png, webp зураг зөвшөөрнө"));
    }
    cb(null, true);
  },
});

router.use(protect);
router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/me/password", updateMyPassword);
router.post("/me/avatar", uploadAvatar.single("avatar"), uploadMyAvatar);
router.get("/options", getOptions);
router.get("/", allowRoles("admin", "security_manager", "shift_supervisor"), getUsers);
router.post("/", allowRoles("admin"), createUser);

module.exports = router;
