const { Sequelize } = require("sequelize");
require("mysql2");

const env = process.env.NODE_ENV || "development";
const config = require("./config.js")[env];

let sequelize;

if (config.use_env_variable) {
  // Production: استخدم DATABASE_URL مباشرة
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Development: استخدم المتغيرات المنفصلة
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected`);
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, dbConnection };