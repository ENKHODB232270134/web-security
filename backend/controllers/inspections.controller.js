const Inspection = require("../models/Inspection");
const { asyncHandler, createAudit, nextCode, resolveLocation, resolveEmployee } = require("./utils");

function mapInspection(doc) {
  const item = doc.toObject();
  return {
    id: item._id,
    code: item.code,
    date: item.inspectionDate,
    inspectedByName: item.inspectedBy
      ? `${item.inspectedBy.firstName} ${item.inspectedBy.lastName || ""}`.trim()
      : item.inspectedByName,
    approvedByName: item.approvedBy
      ? `${item.approvedBy.firstName} ${item.approvedBy.lastName || ""}`.trim()
      : item.approvedByName,
    locationName: item.location?.name || item.locationName,
    inspectionType: item.inspectionType,
    durationMinutes: item.durationMinutes,
    status: item.status,
    notes: item.notes,
  };
}

const getInspections = asyncHandler(async (req, res) => {
  const inspections = await Inspection.find()
    .populate("location")
    .populate("inspectedBy")
    .populate("approvedBy")
    .sort({ inspectionDate: -1 });

  res.json({ data: inspections.map(mapInspection) });
});

const createInspection = asyncHandler(async (req, res) => {
  const { location, locationName } = await resolveLocation(req.body);
  const inspected = await resolveEmployee(req.body.inspectedBy || req.body.inspectedByName);
  const approved = await resolveEmployee(req.body.approvedBy || req.body.approvedByName);

  const inspection = await Inspection.create({
    code: await nextCode(Inspection, "INS"),
    inspectionType: req.body.inspectionType || "Эргүүл шалгалт",
    location,
    locationName,
    inspectedBy: inspected.employee,
    inspectedByName: inspected.employeeName || req.user.fullName,
    approvedBy: approved.employee,
    approvedByName: approved.employeeName,
    inspectionDate: req.body.inspectionDate || new Date(),
    durationMinutes: Number(req.body.durationMinutes || 0),
    status: req.body.status || "Хийгдсэн",
    notes: req.body.notes || "",
    checklistItems: req.body.checklistItems || [],
  });

  await createAudit(req, "Эргүүл бүртгэсэн", "inspections", inspection.code);
  const saved = await Inspection.findById(inspection._id).populate("location").populate("inspectedBy").populate("approvedBy");
  res.status(201).json({ data: mapInspection(saved) });
});

const updateInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id);
  if (!inspection) return res.status(404).json({ message: "Үзлэгийн бүртгэл олдсонгүй" });

  inspection.status = req.body.status || inspection.status;
  inspection.notes = req.body.notes ?? inspection.notes;
  inspection.durationMinutes = req.body.durationMinutes ?? inspection.durationMinutes;
  await inspection.save();

  await createAudit(req, "Эргүүл шинэчилсэн", "inspections", inspection.code);
  const saved = await Inspection.findById(inspection._id).populate("location").populate("inspectedBy").populate("approvedBy");
  res.json({ data: mapInspection(saved) });
});

module.exports = { getInspections, createInspection, updateInspection };
