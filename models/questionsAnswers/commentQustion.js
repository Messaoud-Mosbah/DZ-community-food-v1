const { DataTypes } = require("sequelize");
const { sequelize } = require('../../config/database');

const CommentQuestion = sequelize.define("CommentQuestion", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  text: { type: DataTypes.TEXT, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  questionId: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: "comment_questions",
  timestamps: true,
  hooks: {
    afterCreate: async (comment, options) => {
      const Question = require("./questionModel");
      await Question.increment('commentCount', { where: { id: comment.questionId }, transaction: options.transaction });
    },
    afterDestroy: async (comment, options) => {
      const Question = require("./questionModel");
      await Question.decrement('commentCount', { where: { id: comment.questionId }, transaction: options.transaction });
    }
  }
});

module.exports = CommentQuestion;