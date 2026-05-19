const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LikePosts = sequelize.define("LikePosts", {
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
  tableName: "likes_post",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'postId']
    }
  ],
  hooks: {
    afterCreate: async (like, options) => {
      // استخدام sequelize.models لتفادي مشاكل الـ require الدائري
      await sequelize.models.Post.increment('likeCount', { 
        where: { id: like.postId },
        transaction: options.transaction 
      });
    },
    afterDestroy: async (like, options) => {
      await sequelize.models.Post.decrement('likeCount', { 
        where: { id: like.postId },
        transaction: options.transaction
      });
    }
  }
});

module.exports = LikePosts;