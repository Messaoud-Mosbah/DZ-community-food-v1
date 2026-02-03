const dotenv = require("dotenv");
const express = require("express");
const router = require("./routes/userRoute");
const { connectDB } = require("./config/database");
const mongoose = require("mongoose");

dotenv.config();
const globalError = require("./middlewares/errorMiddleware");

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use("/api/v1/users", router);

connectDB();

app.use(globalError);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
});
