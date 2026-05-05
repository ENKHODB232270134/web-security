const mongoose = require("mongoose");

const permitSubSchema = new mongoose.Schema(
  {
    permitNumber: String,
    validFrom: Date,
    validUntil: Date,
    approvedByName: String,
  },
  { _id: false }
);

const visitorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    registerNo: {
      type: String,
      default: "",
      trim: true,
    },
    organisationName: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    responsibleEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    responsibleName: {
      type: String,
      default: "",
    },
    schedule: {
      type: String,
      enum: ["Урьдчилсан бүртгэлтэй", "Урьдчилсан бүртгэлгүй"],
      default: "Урьдчилсан бүртгэлгүй",
    },
    status: {
      type: String,
      enum: ["Байгаа", "Гарсан", "Хүлээгдэж буй", "Цуцлагдсан"],
      default: "Байгаа",
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    permit: {
      type: permitSubSchema,
      default: null,
    },
  },
  { timestamps: true }
);

visitorSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName || ""}`.trim();
});

module.exports = mongoose.model("Visitor", visitorSchema);
