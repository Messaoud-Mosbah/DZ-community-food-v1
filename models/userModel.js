const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require('sequelize');

const slugify = require("slugify");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
    },
    ////////////////////
    userName: {
      type: Sequelize.STRING(100), 
      unique: true,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_-]+$/,
      },
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_user_email',
        message:"this email is already registed"
      },
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: DataTypes.ENUM("USER", "RESTAURANT", "ADMIN","GUEST"),
      defaultValue: "GUEST",
    },
    ///////////////////////
    status:{
      type: DataTypes.ENUM("ACTIVE","INACTIVE" ,"SUSPENDED"),
      defaultValue: "ACTIVE",
    },
   //////////////////
   isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
     isOnboardingCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    /////////////////
    
    password: {
      type: DataTypes.STRING,
      allowNull: false,

    },
    passwordChangedAt: {
      type: DataTypes.DATE,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    ////////////////
    passwordResetTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    verificationTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    verificationTokenExpires:{
       type: DataTypes.DATE,
      allowNull: true,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    isLoggedOut:{
       type: DataTypes.BOOLEAN,
      defaultValue: false,  
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    //////
    slug: {
      type: DataTypes.STRING,
        defaultValue: null, // مصفوفة فارغة افتراضياً

    },
    pendingEmail: {
  type: DataTypes.STRING,
  allowNull: true,
    defaultValue: null, // مصفوفة فارغة افتراضياً

}
    
    // ---------------------------------------
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
        if (user.changed("userName")) {
          user.slug = slugify(user.userName, { lower: true });
        }
      },
    },
  }
);

module.exports = User;
