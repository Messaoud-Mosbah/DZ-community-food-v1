const { Sequelize } = require("sequelize");
require("mysql2"); 

const env = process.env.NODE_ENV || "development";
const config = require("./config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected: ${config.host}`);
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, dbConnection };
