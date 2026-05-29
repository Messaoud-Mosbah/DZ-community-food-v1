const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const KITCHEN_TYPES = [
  "Vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];

const RestaurantProfile = sequelize.define(
  "RestaurantProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurantName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    businessEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
      defaultValue: null,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    restaurantLogoUrl: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    city: { type: DataTypes.STRING(50), allowNull: false },
    street: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
    postalCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
    },
    googleMapsLink: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    kitchenCategory: {
      type: DataTypes.JSON,
      validate: {
        isValidCategory(value) {
          if (!Array.isArray(value)) throw new Error("Must be an array");
          const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
          if (!isValid)
            throw new Error(
              `Invalid category. Allowed: ${KITCHEN_TYPES.join(", ")}`
            );
        },
      },
      allowNull: false,
    },
    workingDays: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidSchedule(value) {
          if (!Array.isArray(value)) {
            throw new Error("workingDays must be an array of objects");
          }

          const DAYS_OF_WEEK = [
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ];

          value.forEach((item) => {
            if (!DAYS_OF_WEEK.includes(item.day)) {
              throw new Error(
                `Invalid day: ${item.day}. Allowed: ${DAYS_OF_WEEK.join(", ")}`
              );
            }

            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(item.from) || !timeRegex.test(item.to)) {
              throw new Error(
                `Invalid time format for ${item.day}. Use HH:mm (e.g., 08:00)`
              );
            }
          });
        },
      },
    },
    services: {
      type: DataTypes.JSON,
      defaultValue: {
        dineIn: "NO",
        takeAway: "NO",
        delivery: "NO",
        reservation: "NO",
        parkAvailability: "NO",
      }, /////
    },
    userId: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "restaurant_profiles",
    timestamps: true,
  }
);

module.exports = RestaurantProfile;
