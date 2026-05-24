'use strict';
const { sequelize } = require("../config/database");
const { DataTypes } = require('sequelize');

const Follow = sequelize.define(
  "Follow",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  },
  {
    tableName: "follows",
    timestamps: true,
  }
);

module.exports = Follow;