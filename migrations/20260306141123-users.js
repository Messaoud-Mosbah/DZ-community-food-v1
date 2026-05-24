'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userName: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      pendingEmail: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      passwordChangedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      role: {
        type: Sequelize.ENUM("USER", "RESTAURANT", "ADMIN", "GUEST"),
        defaultValue: "GUEST"
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
        defaultValue: "ACTIVE"
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isOnboardingCompleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isLoggedOut: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      passwordResetTokenHash: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      verificationTokenHash: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      verificationTokenExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      // ✅ إضافة عدادات المتابعين
      followersCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      followingCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};