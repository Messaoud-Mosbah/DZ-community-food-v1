const { DataTypes } = require("sequelize");
const {sequelize} = require('../../config/database'); 
const Question = sequelize.define(
  "Question", 
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    // إضافة حقل العنوان هنا
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 255] 
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 5000] 
      }
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPinned: { // أضفته بناءً على استخدامك له في الـ Controller
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', 
        key: 'id'
      }
    },
  },
  {
    tableName: "questions",
    timestamps: true,
    indexes: [
      { fields: ['userId'] }
    ]
  }
);

module.exports = Question;