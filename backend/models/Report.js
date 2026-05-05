const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reportType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      default: "custom",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdByName: {
      type: String,
      default: "Систем",
    },
    periodStart: Date,
    periodEnd: Date,
    filePath: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
