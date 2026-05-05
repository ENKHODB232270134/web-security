const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const { asyncHandler, createAudit } = require("./utils");

function mapEmployee(employee) {
  return {
    id: employee._id,
    employeeCode: employee.employeeCode,
    firstName: employee.firstName,
    lastName: employee.lastName,
    fullName: `${employee.firstName} ${employee.lastName || ""}`.trim(),
    position: employee.position,
    phone: employee.phone,
    email: employee.email,
    hireDate: employee.hireDate,
    status: employee.status,
    department: employee.department
      ? {
          id: employee.department._id,
          code: employee.department.code,
          name: employee.department.name,
        }
      : null,
  };
}

async function nextEmployeeCode() {
  const count = await Employee.countDocuments();
  return `EMP-${String(count + 1).padStart(3, "0")}`;
}

async function findDepartment(departmentIdOrName) {
  if (departmentIdOrName && mongoose.isValidObjectId(departmentIdOrName)) {
    const department = await Department.findById(departmentIdOrName);
    if (department) return department;
  }

  if (departmentIdOrName) {
    const department = await Department.findOne({ name: departmentIdOrName });
    if (department) return department;
  }

  return Department.findOne({ code: "SEC" });
}

const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find().populate("department").sort({ createdAt: -1 });
  res.json({ data: employees.map(mapEmployee) });
});

const createEmployee = asyncHandler(async (req, res) => {
  const department = await findDepartment(req.body.departmentId || req.body.departmentName);

  const employee = await Employee.create({
    employeeCode: req.body.employeeCode || (await nextEmployeeCode()),
    firstName: req.body.firstName || "Нэргүй",
    lastName: req.body.lastName || "",
    department: department?._id || null,
    position: req.body.position || "—",
    phone: req.body.phone || "",
    email: req.body.email || "",
    hireDate: req.body.hireDate || new Date(),
    status: req.body.status || "active",
  });

  await createAudit(req, "Ажилтан нэмсэн", "employees", employee.employeeCode);
  const saved = await Employee.findById(employee._id).populate("department");
  res.status(201).json({ data: mapEmployee(saved) });
});

module.exports = { getEmployees, createEmployee };
