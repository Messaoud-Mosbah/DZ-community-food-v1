const { DataTypes } = require("sequelize");
const {sequelize} = require('../../config/database'); // أضف ../ إضافية للرجوع مستويين
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
          where: { id: like.questionId },
          transaction: options.transaction 
        });
      }
    },
    afterDestroy: async (like, options) => {
      if (sequelize.models.Question) {
        await sequelize.models.Question.decrement('likeCount', { 
          where: { id: like.questionId },
          transaction: options.transaction
        });
      }
    }
  }
});

module.exports = LikeQuestion; 