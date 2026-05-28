const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const UserProfile = sequelize.define("UserProfile", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true, 
    defaultValue: "User Name", 
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null,
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  usageGoal: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [], 
  },
  kitchenCategory: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [], 
  },
  userId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false, 
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'users_profiles', 
  timestamps: true,
});

module.exports = UserProfile;