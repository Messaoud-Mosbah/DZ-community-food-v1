"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// ── 1. استيراد الموديلات الأساسية
const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const CommentPosts = require("./commentPost");
const LikePosts = require("./likePost"); 
const RestaurantProfile = require("./restaurantProfileModel");
const Post = require("./postModel");
const PostMedia = require("./PostMedia");
const Product = require("./productModel");
const CartItem = require("./cartModel");
const Order = require("./orderModel");
const OrderItem = require("./orderItemModel");

// ── 2. استيراد موديلات الأسئلة (المجلد الجديد)
const Question = require("./questionsAnswers/questionModel");
const CommentQuestion = require("./questionsAnswers/commentQustion"); // تأكد من الإملاء Qustion كما في الصورة
const LikeQuestion = require("./questionsAnswers/likeQuestion");
const SavedQuestion = require("./questionsAnswers/savedQuestionModel");

// التحقق من التحميل
if (!User || !Question || !CommentQuestion) {
  console.error("خطأ في تحميل الموديلات!");
}

// ── العلاقات القديمة (User, Profile, Posts)
User.hasOne(UserProfile, { foreignKey: "userId", onDelete: "CASCADE" });
UserProfile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(RestaurantProfile, { foreignKey: "userId", onDelete: "CASCADE" });
RestaurantProfile.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(PostMedia, { foreignKey: "postId", onDelete: "CASCADE", as: "media" });
PostMedia.belongsTo(Post, { foreignKey: "postId", as: "post" });

Post.hasMany(CommentPosts, { foreignKey: "postId", onDelete: "CASCADE", as: "comments" });
CommentPosts.belongsTo(Post, { foreignKey: "postId" });

Post.hasMany(LikePosts, { foreignKey: "postId", onDelete: "CASCADE", as: "likes" });
LikePosts.belongsTo(Post, { foreignKey: "postId" });

// ── 3. علاقات الأسئلة الجديدة (حل مشكلة Association)
// User <=> Question
User.hasMany(Question, { foreignKey: "userId", onDelete: "CASCADE" });
Question.belongsTo(User, { foreignKey: "userId" });

// Question <=> Comment
Question.hasMany(CommentQuestion, { foreignKey: "questionId", onDelete: "CASCADE", as: "comments" });
CommentQuestion.belongsTo(Question, { foreignKey: "questionId" });

// Question <=> Like
Question.hasMany(LikeQuestion, { foreignKey: "questionId", onDelete: "CASCADE", as: "likes" });
LikeQuestion.belongsTo(Question, { foreignKey: "questionId" });

// Question <=> Saved (Bookmarks)
User.hasMany(SavedQuestion, { foreignKey: "userId", onDelete: "CASCADE" });
SavedQuestion.belongsTo(User, { foreignKey: "userId" });

Question.hasMany(SavedQuestion, { foreignKey: "questionId", onDelete: "CASCADE" });
SavedQuestion.belongsTo(Question, { foreignKey: "questionId" });

// User <=> Like/Comment (الخاصة بالأسئلة)
User.hasMany(LikeQuestion, { foreignKey: "userId", onDelete: "CASCADE" });
LikeQuestion.belongsTo(User, { foreignKey: "userId" });

User.hasMany(CommentQuestion, { foreignKey: "userId", onDelete: "CASCADE" });
CommentQuestion.belongsTo(User, { foreignKey: "userId" });

// ── بقية علاقات المتجر
RestaurantProfile.hasMany(Product, { foreignKey: "restaurantProfileId", onDelete: "CASCADE", as: "products" });
Product.belongsTo(RestaurantProfile, { foreignKey: "restaurantProfileId", as: "restaurant" });

User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "CASCADE" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "SET NULL" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
User.hasMany(CommentPosts, { foreignKey: "userId", onDelete: "CASCADE" });
CommentPosts.belongsTo(User, { foreignKey: "userId" });User.hasMany(CommentPosts, { foreignKey: "userId", onDelete: "CASCADE" });
CommentPosts.belongsTo(User, { foreignKey: "userId" });
// ── 4. تصدير جميع الموديلات بما فيها الجديدة
module.exports = {
  sequelize,
  User,
  UserProfile,
  RestaurantProfile,
  Post,
  PostMedia,
  Product,
  CartItem,
  Order,
  OrderItem,
  CommentPosts,
  LikePosts,
  Question,       
  CommentQuestion,
  LikeQuestion,    
  SavedQuestion  
};