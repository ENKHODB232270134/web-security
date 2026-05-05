const mongoose = require("mongoose");

const attachmentSubSchema = new mongoose.Schema(
  {
    fileName: String,
    filePath: String,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const incidentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    incidentType: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Ерөнхий",
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    locationName: {
      type: String,
      default: "",
      trim: true,
    },
    severity: {
      type: String,
      enum: ["Нэн яаралтай", "Өндөр", "Дунд", "Бага"],
      default: "Дунд",
    },
    status: {
      type: String,
      enum: ["Хүлээгдэж буй", "Шийдвэрлэж байна", "Шийдвэрлэсэн", "Хаагдсан"],
      default: "Хүлээгдэж буй",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reportedByName: {
      type: String,
      default: "Систем",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    assignedToName: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    occurredAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    attachments: {
      type: [attachmentSubSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);
