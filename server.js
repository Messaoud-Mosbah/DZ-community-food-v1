const dotenv = require("dotenv");
const express = require("express");
const router = require("./routes/userRoute");
const auth_router = require("./routes/authRoute");
const { connectDB } = require("./config/database");
const mongoose = require("mongoose");

dotenv.config({ path: "./utils/.env" });
const globalError = require("./middlewares/errorMiddleware");

const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json()); //

app.use(express.json());
app.use("/api/v1/users", router);
app.use("/api/v1/auth",auth_router);

connectDB();

app.use(globalError);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
});
