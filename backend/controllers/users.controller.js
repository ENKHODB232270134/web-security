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

module.exports = { getUsers, createUser, getOptions };
