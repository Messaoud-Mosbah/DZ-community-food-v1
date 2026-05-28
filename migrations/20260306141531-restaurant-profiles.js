'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurant_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      restaurantName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      businessEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING(20), 
        allowNull: false,
      },
      restaurantLogoUrl: {
        type: Sequelize.STRING,
        defaultValue:null,
      },
      city: { 
        type: Sequelize.STRING(50) 
      },
     
      street: { 
        type: Sequelize.STRING(50), 
        allowNull: true 
      },
      postalCode: {
        type: Sequelize.STRING(10), 
        allowNull: true,
      },
      googleMapsLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kitchenCategory: {
        type: Sequelize.JSON, 
      },
       bio: {
  type: Sequelize.STRING, 
  allowNull: true,
  defaultValue: null
},
    workingDays: {
       type: Sequelize.JSON,
       allowNull: true,
       defaultValue: [], 
       comment: "structure : [{ day: 'Saturday', from: '08:00', to: '22:00' }, ...]"
      },
      services: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({ dineIn: "NO", takeAway: "NO", delivery: "NO", reservation: "NO" }),
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
    await queryInterface.dropTable('restaurant_profiles');
  }
};