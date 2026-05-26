"use strict";
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// ── 1. استيراد جميع الموديلات
const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const RestaurantProfile = require("./restaurantProfileModel");
const Post = require("./postModel");
const PostMedia = require("./PostMedia");
const CommentPosts = require("./commentPost");
const LikePosts = require("./likePost");
const SavedPost = require("./savedPost");
const Follow = require("./follow");
const Product = require("./productModel");
const CartItem = require("./cartModel");
const Order = require("./orderModel");
const OrderItem = require("./orderItemModel");
const Question = require("./questionsAnswers/questionModel");
const CommentQuestion = require("./questionsAnswers/commentQustion");
const LikeQuestion = require("./questionsAnswers/likeQuestion");
const SavedQuestion = require("./questionsAnswers/savedQuestionModel");

// ── 2. علاقات User & Profiles
User.hasOne(UserProfile, { foreignKey: "userId", onDelete: "CASCADE" });
UserProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(RestaurantProfile, { foreignKey: "userId", onDelete: "CASCADE" });
RestaurantProfile.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

// ── 3. علاقات Posts
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(PostMedia, { foreignKey: "postId", onDelete: "CASCADE", as: "media" });
PostMedia.belongsTo(Post, { foreignKey: "postId", as: "post" });

Post.hasMany(CommentPosts, { foreignKey: "postId", onDelete: "CASCADE", as: "comments" });
CommentPosts.belongsTo(Post, { foreignKey: "postId" });
User.hasMany(CommentPosts, { foreignKey: "userId", onDelete: "CASCADE" });
CommentPosts.belongsTo(User, { foreignKey: "userId", as: "user" });

Post.hasMany(LikePosts, { foreignKey: "postId", onDelete: "CASCADE", as: "likes" });
LikePosts.belongsTo(Post, { foreignKey: "postId" });
User.hasMany(LikePosts, { foreignKey: "userId", onDelete: "CASCADE" });
LikePosts.belongsTo(User, { foreignKey: "userId" });

User.hasMany(SavedPost, { foreignKey: "userId", onDelete: "CASCADE" });
SavedPost.belongsTo(User, { foreignKey: "userId" });
Post.hasMany(SavedPost, { foreignKey: "postId", onDelete: "CASCADE" });
SavedPost.belongsTo(Post, { foreignKey: "postId" });

// ── 4. علاقات Follow
User.hasMany(Follow, { foreignKey: "followerId", as: "following", onDelete: "CASCADE" });
User.hasMany(Follow, { foreignKey: "followingId", as: "followers", onDelete: "CASCADE" });
Follow.belongsTo(User, { foreignKey: "followerId", as: "follower" });
Follow.belongsTo(User, { foreignKey: "followingId", as: "followed" });

// ── 5. علاقات Store
RestaurantProfile.hasMany(Product, { foreignKey: "restaurantProfileId", onDelete: "CASCADE", as: "products" });
Product.belongsTo(RestaurantProfile, { foreignKey: "restaurantProfileId", as: "restaurant" });

User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId" });
Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "CASCADE" });
CartItem.belongsTo(Product, { foreignKey: "productId" });
RestaurantProfile.hasMany(CartItem, { foreignKey: "restaurantProfileId", onDelete: "CASCADE" });
CartItem.belongsTo(RestaurantProfile, { foreignKey: "restaurantProfileId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });
RestaurantProfile.hasMany(Order, { foreignKey: "restaurantProfileId", onDelete: "CASCADE" });
Order.belongsTo(RestaurantProfile, { foreignKey: "restaurantProfileId" });
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "SET NULL" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// ── 6. علاقات Questions
User.hasMany(Question, { foreignKey: "userId", onDelete: "CASCADE" });
Question.belongsTo(User, { foreignKey: "userId" });

Question.hasMany(CommentQuestion, { foreignKey: "questionId", onDelete: "CASCADE", as: "comments" });
CommentQuestion.belongsTo(Question, { foreignKey: "questionId" });
User.hasMany(CommentQuestion, { foreignKey: "userId", onDelete: "CASCADE" });
CommentQuestion.belongsTo(User, { foreignKey: "userId", as: "user" });

Question.hasMany(LikeQuestion, { foreignKey: "questionId", onDelete: "CASCADE", as: "likes" });
LikeQuestion.belongsTo(Question, { foreignKey: "questionId" });
User.hasMany(LikeQuestion, { foreignKey: "userId", onDelete: "CASCADE" });
LikeQuestion.belongsTo(User, { foreignKey: "userId" });

User.hasMany(SavedQuestion, { foreignKey: "userId", onDelete: "CASCADE" });
SavedQuestion.belongsTo(User, { foreignKey: "userId" });
Question.hasMany(SavedQuestion, { foreignKey: "questionId", onDelete: "CASCADE" });
SavedQuestion.belongsTo(Question, { foreignKey: "questionId" });

// ── 7. تصدير جميع الموديلات
module.exports = {
  sequelize,
  User,
  UserProfile,
  RestaurantProfile,
  Post,
  PostMedia,
  CommentPosts,
  LikePosts,
  SavedPost,
  Follow,
  Product,
  CartItem,
  Order,
  OrderItem,
  Question,
  CommentQuestion,
  LikeQuestion,
  SavedQuestion,
};