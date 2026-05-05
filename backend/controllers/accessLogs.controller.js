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
    personType: req.body.personType || "Ажилтан",
    personName: req.body.personName || "Тодорхойгүй",
    position: req.body.position || "",
    location,
    locationName,
    accessType: req.body.accessType || "Нэвтэрсэн",
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

module.exports = { getAccessLogs, createAccessLog };
