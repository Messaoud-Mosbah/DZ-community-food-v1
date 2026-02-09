const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
dotenv.config({ path: ".env" });

const dbConnection = require("./config/database");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");

const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");

//connect to db always first
dbConnection();

// second thing owr express app
const app = express();

//third  thing owr middelwares
app.use(express.json());
app.use(cors());
//morgan used to  give us information about the req and res
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);

// use that to handle any non expected route
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8001;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  app.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
