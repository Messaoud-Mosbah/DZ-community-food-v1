
  
const mongoose = require('mongoose');

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => {
      console.log(`MongoDB connected ${conn.connection.host}/ ${conn.connection.name}`);
    })
    
};

module.exports = dbConnection;