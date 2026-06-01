const { DataTypes, Op } = require("sequelize");
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
      if (sequelize.models.Post) {
        await sequelize.models.Post.increment('likeCount', {
          by: 1,
          where: { id: like.postId },
          transaction: options.transaction
        });
      }
    },
    afterDestroy: async (like, options) => {
      if (sequelize.models.Post) {
        await sequelize.models.Post.decrement('likeCount', {
          by: 1,
          where: {
            id: like.postId,
            likeCount: { [Op.gt]: 0 } // ✅ حماية من السالب
          },
          transaction: options.transaction
        });
      }
    }
  }
});

module.exports = LikePosts;