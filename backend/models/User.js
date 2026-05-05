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
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email format буруу байна"],
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
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    roleDisplayName: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 600,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    themePreference: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },
    accentColor: {
      type: String,
      enum: ["blue", "green", "purple", "orange", "red"],
      default: "blue",
    },
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      dashboardAlerts: {
        type: Boolean,
        default: true,
      },
      incidentUpdates: {
        type: Boolean,
        default: true,
      },
      visitorAlerts: {
        type: Boolean,
        default: true,
      },
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
    email: this.email,
    name: this.fullName,
    fullName: this.fullName,
    phone: this.phone,
    jobTitle: this.jobTitle,
    department: this.department,
    roleDisplayName: this.roleDisplayName || this.role?.label || "",
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    themePreference: this.themePreference,
    accentColor: this.accentColor,
    notificationSettings: this.notificationSettings,
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
