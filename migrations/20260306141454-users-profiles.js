'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING(20), 
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profilePicture: {
        type: Sequelize.STRING(255),
        defaultValue: "default.png",
      },
     usageGoal:{
          type: Sequelize.JSON, 
          allowNull: true,
            defaultValue: [],

           },
        kitchenCategory: {
          type: Sequelize.JSON, 
          allowNull: true,
            defaultValue: [], 

        },
      userId: {
        type: Sequelize.UUID, 
        unique: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('users_profiles');
  }
};