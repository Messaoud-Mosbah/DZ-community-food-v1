const { DataTypes } = require("sequelize");
const {sequelize} = require('../../config/database'); // أضف ../ إضافية للرجوع مستويينconst Question = require("./questionModel");

const SavedQuestion = sequelize.define("SavedQuestion", {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  questionId: {
    type: DataTypes.UUID, 
    allowNull: false 
  },
}, {
  tableName: "saved_questions",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'questionId'] 
    }
  ],
});

module.exports = SavedQuestion; 