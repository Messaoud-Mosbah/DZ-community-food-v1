const { DataTypes } = require("sequelize");
const {sequelize} = require('../../config/database'); // أضف ../ إضافية للرجوع مستويينconst Question = require("./questionModel");

const savedPost = sequelize.define("savedPost", {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  postId: {
    type: DataTypes.UUID, 
    allowNull: false 
  },
}, {
  tableName: "saved_post",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'postId'] 
    }
  ],
});

module.exports = savedPost; 