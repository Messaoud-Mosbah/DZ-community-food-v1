const path = require("path");
const dotenv = require("dotenv");

// قراءة متغيرات البيئة محلياً (إذا كان الملف موجوداً)
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
  "https://feedme-algeria.vercel.app", 
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
app.options("*", cors(corsOptions));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// ── Database Connection Middleware (لضمان الاتصال في الـ Serverless) ──
let isConnected = false;

const connectDB = async (req, res, next) => {
  if (isConnected) {
    return next();
  }
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    
    // في بيئة Serverless يفضل عمل sync فقط في التطوير، ولكن هذا السطر آمن إذا كانت الجداول منشأة بالفعل
    await sequelize.sync();
    console.log("✅ Database synced successfully.");
    
    isConnected = true;
    next();
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    return res.status(500).json({ status: "ERROR", message: "Database connection failed" });
  }
};

// تفعيل ميكانيكية الاتصال عند كل طلب قادم للـ API
app.use(connectDB);

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

app.use((err, req, res, next) => {
  console.error("ERROR DETAILS:", err);
  res.status(500).json({ status: "ERROR", message: "Something went very wrong!" });
});

// ── تشغيل السيرفر محلياً فقط (Local Development) ──
// Vercel سيتجاهل هذا الجزء تماماً ويستخدم الـ export في الأسفل
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server started on port ${PORT}`);
  });
}

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  process.exit(1);
});

// التصدير الأساسي الذي يعتمد عليه Vercel تشغيلياً
module.exports = app;