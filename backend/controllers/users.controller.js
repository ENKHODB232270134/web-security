const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Location = require("../models/Location");
const { asyncHandler, createAudit } = require("./utils");

function mapStatus(status) {
  if (status === "Идэвхтэй") return "active";
  if (status === "Идэвхгүй") return "disabled";
  return status || "active";
}

function mapUser(user) {
  return {
    id: user._id,
    username: user.username,
    fullName: user.fullName,
    status: user.status,
    expiresAt: user.expiresAt,
    role: user.role
      ? {
          id: user.role._id,
          name: user.role.name,
          label: user.role.label,
        }
      : null,
    employee: user.employee
      ? {
          id: user.employee._id,
          employeeCode: user.employee.employeeCode,
          fullName: `${user.employee.firstName} ${user.employee.lastName || ""}`.trim(),
          position: user.employee.position,
        }
      : null,
  };
}

function mapProfile(user) {
  return user.toSafeObject ? user.toSafeObject() : mapUser(user);
}

async function findRole(roleIdOrName) {
  if (roleIdOrName && mongoose.isValidObjectId(roleIdOrName)) {
    const role = await Role.findById(roleIdOrName);
    if (role) return role;
  }

  if (roleIdOrName) {
    const role = await Role.findOne({
      $or: [{ name: roleIdOrName }, { label: roleIdOrName }],
    });
    if (role) return role;
  }

  return Role.findOne({ name: "viewer" });
}

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate("role").populate("employee").sort({ createdAt: -1 });
  res.json({ data: users.map(mapUser) });
});

const createUser = asyncHandler(async (req, res) => {
  const role = await findRole(req.body.roleId || req.body.roleName);
  const employee =
    req.body.employeeId && mongoose.isValidObjectId(req.body.employeeId)
      ? await Employee.findById(req.body.employeeId)
      : null;

  const user = await User.create({
    username: req.body.username,
    passwordHash: req.body.password || "User@1234",
    fullName: req.body.fullName || req.body.name || req.body.username,
    role: role._id,
    employee: employee?._id || null,
    status: mapStatus(req.body.status),
    expiresAt: req.body.expiresAt || req.body.expireDate || null,
  });

  await createAudit(req, "Хэрэглэгч нэмсэн", "users", user._id);
  const saved = await User.findById(user._id).populate("role").populate("employee");

  res.status(201).json({ data: mapUser(saved) });
});

const getOptions = asyncHandler(async (req, res) => {
  const [roles, employees, departments, locations, users] = await Promise.all([
    Role.find().sort({ label: 1 }),
    Employee.find().populate("department").sort({ firstName: 1 }),
    Department.find().sort({ name: 1 }),
    Location.find().sort({ name: 1 }),
    User.find().populate("role").sort({ username: 1 }),
  ]);

  res.json({
    roles: roles.map((role) => ({
      id: role._id,
      name: role.name,
      label: role.label,
      description: role.description,
    })),
    employees: employees.map((employee) => ({
      id: employee._id,
      employeeCode: employee.employeeCode,
      fullName: `${employee.firstName} ${employee.lastName || ""}`.trim(),
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      departmentName: employee.department?.name || "",
    })),
    departments: departments.map((department) => ({
      id: department._id,
      code: department.code,
      name: department.name,
      description: department.description,
    })),
    locations: locations.map((location) => ({
      id: location._id,
      code: location.code,
      name: location.name,
      type: location.type,
      address: location.address,
      description: location.description,
    })),
    users: users.map(mapUser),
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("role").populate("employee");
  res.json({ user: mapProfile(user) });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("role").populate("employee");
  if (!user) return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });

  const email = String(req.body.email || "").trim().toLowerCase();
  if (email && email !== user.email) {
    const duplicate = await User.findOne({ email, _id: { $ne: user._id } });
    if (duplicate) {
      return res.status(409).json({ message: "Энэ email өөр хэрэглэгч дээр бүртгэлтэй байна" });
    }
    user.email = email;
  }

  user.fullName = req.body.fullName || req.body.name || user.fullName;
  user.phone = req.body.phone ?? user.phone;
  user.jobTitle = req.body.jobTitle ?? user.jobTitle;
  user.department = req.body.department ?? user.department;
  user.roleDisplayName = req.body.roleDisplayName ?? user.roleDisplayName;
  user.bio = req.body.bio ?? user.bio;

  if (req.body.themePreference) user.themePreference = req.body.themePreference;
  if (req.body.accentColor) user.accentColor = req.body.accentColor;
  if (req.body.notificationSettings) {
    user.notificationSettings = {
      ...user.notificationSettings?.toObject?.(),
      ...req.body.notificationSettings,
    };
  }

  await user.save();
  await createAudit(req, "Хэрэглэгчийн тохиргоо шинэчилсэн", "users", user._id);
  const saved = await User.findById(user._id).populate("role").populate("employee");
  res.json({ user: saved.toSafeObject() });
});

const updateMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Одоогийн болон шинэ нууц үгээ бүрэн оруулна уу" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Шинэ нууц үг давталттайгаа таарахгүй байна" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байна" });
  }

  const user = await User.findById(req.user._id).select("+passwordHash");
  if (!user || !(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: "Одоогийн нууц үг буруу байна" });
  }

  user.passwordHash = newPassword;
  await user.save();
  await createAudit(req, "Нууц үг шинэчилсэн", "users", user._id);

  res.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" });
});

const uploadMyAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Зураг файл сонгоно уу" });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl },
    { new: true }
  )
    .populate("role")
    .populate("employee");

  await createAudit(req, "Профайл зураг шинэчилсэн", "users", user._id);
  res.json({ avatarUrl, user: user.toSafeObject() });
});

module.exports = {
  getUsers,
  createUser,
  getOptions,
  getMe,
  updateMe,
  updateMyPassword,
  uploadMyAvatar,
};
