const { DataTypes, Op } = require("sequelize");
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
      if (sequelize.models.Question) {
        await sequelize.models.Question.increment('commentCount', {
          by: 1,
          where: { id: comment.questionId },
          transaction: options.transaction
        });
      }
    },
    afterDestroy: async (comment, options) => {
      if (sequelize.models.Question) {
        await sequelize.models.Question.decrement('answerCount', {
          by: 1,
          where: {
            id: comment.questionId,
            answerCount: { [Op.gt]: 0 } 
          },
          transaction: options.transaction
        });
      }
    }
  }
});

module.exports = CommentQuestion;