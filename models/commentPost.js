const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../config/database");

const CommentPosts = sequelize.define("CommentPosts", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
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
  tableName: "comments_posts",
  timestamps: true,
  hooks: {
    afterCreate: async (comment, options) => {
      if (sequelize.models.Post) {
        await sequelize.models.Post.increment('commentCount', {
          by: 1,
          where: { id: comment.postId },
          transaction: options.transaction
        });
      }
    },
    afterDestroy: async (comment, options) => {
      if (sequelize.models.Post) {
        await sequelize.models.Post.decrement('commentCount', {
          by: 1,
          where: {
            id: comment.postId,
            commentCount: { [Op.gt]: 0 } // ✅ حماية من السالب
          },
          transaction: options.transaction
        });
      }
    }
  }
});

module.exports = CommentPosts;