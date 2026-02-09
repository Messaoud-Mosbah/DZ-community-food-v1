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
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ],
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
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please add a valid email address",
      ],
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
      enum: ["user", "restaurant", "admin"],
      default: "user",
    },

    active: {
      type: Boolean,
      default: true,
    },

    //USER PROFILE
    //profile.(fullName/profilePicture/city/phone/bio/socialLinks)
    profile: {
      fullName: {
        type: String,
        trim: true,
        minlength: [3, "full name too short"],
        maxlength: [50, "full name too long"],
      },

      profilePicture: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, "Invalid image URL"],
      },

      city: {
        type: String,
        trim: true,
        minlength: [2, "city name too short"],
        maxlength: [30, "city name too long"],
      },

      phone: {
        type: String,
        trim: true,
      },

      bio: {
        type: String,
        trim: true,
        maxlength: [200, "bio too long"],
      },

      socialLinks: [
        {
          type: String,
          trim: true,
          match: [/^https?:\/\/.+/, "Invalid URL"],
        },
      ],
    },
    //foodPrefences.(favoriteCuisines/ dietaryPreference/spiceLevel)
    foodPreferences: {
      favoriteCuisines: [
        {
          type: String,
          enum: ["Italian", "Asian", "Fast Food", "Traditional", "Vegan"],
        },
      ],

      dietaryPreference: {
        type: String,
        enum: ["None", "Vegetarian", "Vegan", "Halal", "Gluten-free"],
        default: "None",
      },

      spiceLevel: {
        type: String,
        enum: ["Mild", "Medium", "Hot"],
      },
    },

    usagePreferences: {
      discoverRestaurants: {
        type: Boolean,
        default: false,
      },
      sharePhotos: {
        type: Boolean,
        default: false,
      },
      writeReviews: {
        type: Boolean,
        default: false,
      },
      followCreators: {
        type: Boolean,
        default: false,
      },
    },

    // RESTAURANT PROFILE
    restaurant: {
      restaurantName: {
        type: String,
        trim: true,
        minlength: [3, "restaurant name too short"],
        maxlength: [60, "restaurant name too long"],
      },

      logo: {
        type: String,
        trim: true,
      },

      ownerName: {
        type: String,
        trim: true,
        minlength: [3, "owner name too short"],
        maxlength: [50, "owner name too long"],
      },

      businessEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      address: {
        type: String,
        trim: true,
        minlength: [5, "address too short"],
        maxlength: [100, "address too long"],
      },

      city: {
        type: String,
        trim: true,
        minlength: [2, "city too short"],
        maxlength: [30, "city too long"],
      },

      googleMapsLink: {
        type: String,
        trim: true,
      },

      deliveryAvailable: {
        type: Boolean,
        default: false,
      },

      cuisineTypes: [
        {
          type: String,
          enum: [
            "Traditional",
            "Italian",
            "Asian",
            "Fast Food",
            "Cafe",
            "Dessert",
          ],
        },
      ],

      priceRange: {
        type: String,
        enum: ["affordable", "medium", "expensive"],
      },

      openingHours: {
        open: {
          type: String,
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"],
        },
        close: {
          type: String,
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"],
        },
      },

      daysOpen: [
        {
          type: String,
          enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
      ],

      services: {
        dineIn: { type: Boolean, default: false },
        takeaway: { type: Boolean, default: false },
        delivery: { type: Boolean, default: false },
        reservation: { type: Boolean, default: false },
      },

      businessRegistrationNumber: {
        type: String,
        trim: true,
        minlength: [4, "registration number too short"],
        maxlength: [30, "registration number too long"],
      },

      description: {
        type: String,
        trim: true,
        minlength: [10, "description too short"],
        maxlength: [500, "description too long"],
      },
    },
  },
  { timestamps: true },
);

// hashing and sulgify
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
