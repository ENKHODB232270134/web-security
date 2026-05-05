const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");
const Location = require("../models/Location");
const Employee = require("../models/Employee");

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

async function createAudit(req, actionType, entityName, entityId, metadata = {}) {
  await AuditLog.create({
    user: req.user?._id || null,
    username: req.user?.username || "system",
    userFullName: req.user?.fullName || "Систем",
    actionType,
    entityName,
    entityId: String(entityId || ""),
    ipAddress: req.ip || req.headers?.["x-forwarded-for"] || "",
    metadata,
  });
}

async function nextCode(Model, prefix) {
  const docs = await Model.find({ code: new RegExp(`^${prefix}-`) }).select("code").lean();
  const max = docs.reduce((value, doc) => {
    const number = Number(String(doc.code || "").replace(`${prefix}-`, ""));
    return Number.isFinite(number) ? Math.max(value, number) : value;
  }, 0);

  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

async function resolveLocation(body = {}) {
  const id = body.locationId || body.location;
  if (id && mongoose.isValidObjectId(id)) {
    const location = await Location.findById(id);
    return {
      location: location?._id || null,
      locationName: location?.name || body.locationName || "",
    };
  }

  const name = String(body.locationName || body.location || "").trim();
  if (!name) return { location: null, locationName: "" };

  const location = await Location.findOne({ name });
  return {
    location: location?._id || null,
    locationName: location?.name || name,
  };
}

async function resolveEmployee(idOrName) {
  if (!idOrName) return { employee: null, employeeName: "" };

  if (mongoose.isValidObjectId(idOrName)) {
    const employee = await Employee.findById(idOrName);
    return {
      employee: employee?._id || null,
      employeeName: employee ? `${employee.firstName} ${employee.lastName || ""}`.trim() : "",
    };
  }

  const name = String(idOrName).trim();
  const parts = name.split(" ").filter(Boolean);
  const employee = await Employee.findOne({
    $or: [
      { firstName: name },
      { lastName: name },
      { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") },
    ],
  });

  return {
    employee: employee?._id || null,
    employeeName: employee ? `${employee.firstName} ${employee.lastName || ""}`.trim() : name,
  };
}

module.exports = {
  asyncHandler,
  createAudit,
  nextCode,
  resolveLocation,
  resolveEmployee,
};
