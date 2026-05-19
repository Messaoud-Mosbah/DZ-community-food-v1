const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const post = require("./postModel");

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
      await post.increment('commentCount', { 
        where: { id: comment.postId }, 
        transaction: options.transaction 
      });
    },
    afterDestroy: async (comment, options) => {
      await post.decrement('commentCount', { 
        where: { id: comment.postId }, 
        transaction: options.transaction 
      });
    }
  }
});

module.exports = CommentPosts;