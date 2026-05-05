const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    title: String,
    passed: {
      type: Boolean,
      default: true,
    },
    note: String,
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    inspectionType: {
      type: String,
      enum: ["Эргүүл шалгалт", "Объектын үзлэг", "Постын хяналт", "Техникийн хяналт"],
      default: "Эргүүл шалгалт",
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    locationName: {
      type: String,
      default: "",
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    inspectedByName: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    approvedByName: {
      type: String,
      default: "",
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Хийгдсэн", "Хоцорсон", "Хүлээгдэж буй"],
      default: "Хийгдсэн",
    },
    notes: {
      type: String,
      default: "",
    },
    checklistItems: {
      type: [checklistItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inspection", inspectionSchema);
