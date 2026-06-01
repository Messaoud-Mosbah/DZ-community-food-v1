'use strict';
const { sequelize } = require("../config/database");
const { DataTypes, Op } = require('sequelize');

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
    hooks: {
      afterCreate: async (follow, options) => {
        if (sequelize.models.User) {
          // زيد followingCount ديال اللي دار الفولو
          await sequelize.models.User.increment('followingCount', {
            by: 1,
            where: { id: follow.followerId },
            transaction: options.transaction
          });
          // زيد followersCount ديال اللي تفولو عليه
          await sequelize.models.User.increment('followersCount', {
            by: 1,
            where: { id: follow.followingId },
            transaction: options.transaction
          });
        }
      },
      afterDestroy: async (follow, options) => {
        if (sequelize.models.User) {
          // نقص followingCount ديال اللي دار الأنفولو
          await sequelize.models.User.decrement('followingCount', {
            by: 1,
            where: {
              id: follow.followerId,
              followingCount: { [Op.gt]: 0 } // ✅ حماية من السالب
            },
            transaction: options.transaction
          });
          // نقص followersCount ديال اللي تأنفولو عليه
          await sequelize.models.User.decrement('followersCount', {
            by: 1,
            where: {
              id: follow.followingId,
              followersCount: { [Op.gt]: 0 } // ✅ حماية من السالب
            },
            transaction: options.transaction
          });
        }
      }
    }
  }
);

module.exports = Follow;