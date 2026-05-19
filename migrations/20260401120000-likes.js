"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("likes_post", { // تغيير الاسم ليطابق tableName: "likes_post"
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" }, 
        onDelete: "CASCADE",
      },
      postId: { // تغيير من productId إلى postId
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "posts", key: "id" }, // المرجع إلى جدول المنشورات
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("likes_post", ["userId", "postId"], {
      unique: true,
      name: "unique_user_post_like",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("likes_post");
  },
};