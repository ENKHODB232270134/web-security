const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();

  const alreadyHashed = this.passwordHash.startsWith("$2a$") || this.passwordHash.startsWith("$2b$");
  if (!alreadyHashed) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    this.passwordChangedAt = new Date();
  }

  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    username: this.username,
    fullName: this.fullName,
    status: this.status,
    expiresAt: this.expiresAt,
    role: this.role
      ? {
          id: this.role._id,
          name: this.role.name,
          label: this.role.label,
          permissions: this.role.permissions || [],
        }
      : null,
    employee: this.employee
      ? {
          id: this.employee._id,
          employeeCode: this.employee.employeeCode,
          fullName: `${this.employee.firstName} ${this.employee.lastName || ""}`.trim(),
          position: this.employee.position,
        }
      : null,
  };
};

module.exports = mongoose.model("User", userSchema);
