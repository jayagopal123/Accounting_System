const express = require("express");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const accountRoutes = require("./routes/accountRoutes");
const errorHandler = require("./middleware/errorHandler");
import customerRoutes from "./routes/customerRoutes.js";
const ApiError = require("./utils/ApiError");


const app = express();

// 1. Register Global Parse Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/customers", customerRoutes);


// 2. Mount API Routes under v1 namespace
app.use("/api/v1", routes);
app.use("/api/accounts", accountRoutes);
app.use("*", (req, res, next) => {
  next(
    new ApiError(404, `Route ${req.originalUrl} not found`, "ROUTE_NOT_FOUND"),
  );
});

app.use(errorHandler);

module.exports = app;
