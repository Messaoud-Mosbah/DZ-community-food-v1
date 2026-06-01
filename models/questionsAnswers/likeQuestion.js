const { DataTypes, Op } = require("sequelize");
const { sequelize } = require('../../config/database');

const LikeQuestion = sequelize.define("LikeQuestion", {
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
  tableName: "Like_questions",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'questionId']
    }
  ],
  hooks: {
    afterCreate: async (like, options) => {
      if (sequelize.models.Question) {
        await sequelize.models.Question.increment('likeCount', {
          by: 1,
          where: { id: like.questionId },
          transaction: options.transaction
        });
      }
    },
    afterDestroy: async (like, options) => {
      if (sequelize.models.Question) {
        await sequelize.models.Question.decrement('likeCount', {
          by: 1,
          where: {
            id: like.questionId,
            likeCount: { [Op.gt]: 0 } // ✅ حماية من السالب
          },
          transaction: options.transaction
        });
      }
    }
  }
});

module.exports = LikeQuestion;