const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "user name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [8, "password is too short"],
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);
// hashing the psw
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate slug before save
userSchema.pre("save", function (next) {
  if (this.isModified("userName")) {
    this.slug = slugify(this.userName, { lower: true });
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
