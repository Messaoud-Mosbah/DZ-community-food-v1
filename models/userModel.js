const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "user name is required"],
      minlength: [6, "user name is too short"],
      maxlength: [18, "user name is too long"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please add a valid email address'],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "password is too short"],
      maxlength: [18, "password is too long"],
      select: false,
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["user", "resturant", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Middlewares
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", function (next) {
  if (this.isModified("userName")) {
    this.slug = slugify(this.userName, { lower: true });
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;