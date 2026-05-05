const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    personType: {
      type: String,
      enum: ["Ажилтан", "Зочин", "Тээврийн хэрэгсэл"],
      default: "Ажилтан",
    },
    personName: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      default: "",
      trim: true,
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      default: null,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
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
    accessType: {
      type: String,
      enum: ["Нэвтэрсэн", "Гарсан"],
      required: true,
    },
    accessTime: {
      type: Date,
      default: Date.now,
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
    purpose: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessLog", accessLogSchema);
