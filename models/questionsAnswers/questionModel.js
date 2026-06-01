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
    answerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isSolved: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},
isClosed: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},
    isPinned: { 
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