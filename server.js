const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "config.env") });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { sequelize } = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");

const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");
const editProfileRouter = require("./routes/editProfileRoute");
const viewProfileRouter = require("./routes/viewProfileRoute");
const postRoutes = require("./routes/postRoutes");
const productRoutes = require("./routes/productRoute");
const storeRoutes = require("./routes/storeRoute");
const cartRoutes = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoute");
const questionRoutes = require("./routes/questionsAnswersRoutes");

const app = express();

// ── Middlewares ───────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://your-frontend.vercel.app", // ← بدّلها برابط الفرونت الحقيقي
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ← معالج preflight لكل الروتات

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// ── Static Files ──────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────
app.use("/api/users", userRouter);
app.use("/api/authentication", authRouter);
app.use("/api/profile", editProfileRouter);
app.use("/api/profile", viewProfileRouter);
app.use("/api/posts", postRoutes);
app.use("/api/products", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/questions", questionRoutes);

// ── 404 Handler ───────────────────────────────────────
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

// ── Start Server ──────────────────────────────────────
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    await sequelize.sync();
    console.log("✅ Database synced successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server started at port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  process.exit(1);
});