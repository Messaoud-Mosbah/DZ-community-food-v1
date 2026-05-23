'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('saved_post', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      postId: {                          // ✅ d صغيرة — متطابق مع الـ Model
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'posts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // ✅ addIndex منفصلة — أكثر موثوقية
    await queryInterface.addIndex('saved_post', ['userId', 'postId'], {
      unique: true,
      name: 'unique_user_post',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('saved_post', 'unique_user_post');
    await queryInterface.dropTable('saved_post');
  },
};