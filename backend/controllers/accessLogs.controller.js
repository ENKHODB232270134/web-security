const AccessLog = require("../models/AccessLog");
const { asyncHandler, createAudit, nextCode, resolveLocation, resolveEmployee } = require("./utils");

function mapAccessLog(doc) {
  const item = doc.toObject();
  return {
    id: item._id,
    code: item.code,
    date: item.accessTime,
    personName: item.personName,
    position: item.position,
    personType: item.personType,
    locationName: item.location?.name || item.locationName,
    accessType: item.accessType,
    approvedByName: item.approvedBy
      ? `${item.approvedBy.firstName} ${item.approvedBy.lastName || ""}`.trim()
      : item.approvedByName,
    purpose: item.purpose,
    note: item.note,
  };
}

function normalizePersonType(value) {
  const map = {
    employee: "Ажилтан",
    staff: "Ажилтан",
    visitor: "Зочин",
    vehicle: "Тээврийн хэрэгсэл",
  };
  return map[String(value || "").toLowerCase()] || value || "Ажилтан";
}

function normalizeAccessType(value) {
  const map = {
    in: "Нэвтэрсэн",
    entry: "Нэвтэрсэн",
    enter: "Нэвтэрсэн",
    out: "Гарсан",
    exit: "Гарсан",
    leave: "Гарсан",
  };
  return map[String(value || "").toLowerCase()] || value || "Нэвтэрсэн";
}

const getAccessLogs = asyncHandler(async (req, res) => {
  const accessLogs = await AccessLog.find()
    .populate("location")
    .populate("approvedBy")
    .sort({ accessTime: -1 });

  res.json({ data: accessLogs.map(mapAccessLog) });
});

const createAccessLog = asyncHandler(async (req, res) => {
  const { location, locationName } = await resolveLocation(req.body);
  const approved = await resolveEmployee(req.body.approvedBy || req.body.approvedByName);

  const accessLog = await AccessLog.create({
    code: await nextCode(AccessLog, "ALG"),
    personType: normalizePersonType(req.body.personType),
    personName: req.body.personName || "Тодорхойгүй",
    position: req.body.position || "",
    location,
    locationName,
    accessType: normalizeAccessType(req.body.accessType),
    accessTime: req.body.accessTime || new Date(),
    approvedBy: approved.employee,
    approvedByName: approved.employeeName,
    purpose: req.body.purpose || "",
    note: req.body.note || "",
  });

  await createAudit(req, `${accessLog.accessType} бүртгэл`, "access_logs", accessLog.code);
  const saved = await AccessLog.findById(accessLog._id).populate("location").populate("approvedBy");
  res.status(201).json({ data: mapAccessLog(saved) });
});

const updateAccessLog = asyncHandler(async (req, res) => {
  const accessLog = await AccessLog.findById(req.params.id);
  if (!accessLog) return res.status(404).json({ message: "access log олдсонгүй" });

  const { location, locationName } = await resolveLocation(req.body);
  const approved = await resolveEmployee(req.body.approvedBy || req.body.approvedByName);

  accessLog.personType = req.body.personType ? normalizePersonType(req.body.personType) : accessLog.personType;
  accessLog.personName = req.body.personName || accessLog.personName;
  accessLog.position = req.body.position ?? accessLog.position;
  accessLog.location = location || accessLog.location;
  accessLog.locationName = locationName || accessLog.locationName;
  accessLog.accessType = req.body.accessType ? normalizeAccessType(req.body.accessType) : accessLog.accessType;
  accessLog.accessTime = req.body.accessTime || accessLog.accessTime;
  accessLog.approvedBy = approved.employee || accessLog.approvedBy;
  accessLog.approvedByName = approved.employeeName || accessLog.approvedByName;
  accessLog.purpose = req.body.purpose ?? accessLog.purpose;
  accessLog.note = req.body.note ?? accessLog.note;

  await accessLog.save();
  await createAudit(req, "Нэвтрэх/гарах бүртгэл шинэчилсэн", "access_logs", accessLog.code);
  const saved = await AccessLog.findById(accessLog._id).populate("location").populate("approvedBy");
  res.json({ data: mapAccessLog(saved) });
});

const deleteAccessLog = asyncHandler(async (req, res) => {
  const accessLog = await AccessLog.findByIdAndDelete(req.params.id);
  if (!accessLog) return res.status(404).json({ message: "access log олдсонгүй" });

  await createAudit(req, "Нэвтрэх/гарах бүртгэл устгасан", "access_logs", accessLog.code);
  res.json({ message: "access log устгагдлаа" });
});

module.exports = { getAccessLogs, createAccessLog, updateAccessLog, deleteAccessLog };
