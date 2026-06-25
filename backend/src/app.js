import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import accountRoutes from "./routes/accountRoutes.js";

import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import journalEntryRoutes from "./routes/journalEntryRoutes.js";
import salesInvoiceRoutes from "./routes/salesInvoiceRoutes.js";
import purchaseInvoiceRoutes from "./routes/purchaseInvoiceRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import ApiError from "./utils/ApiError.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", routes);

app.use("/api/accounts", accountRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/journal-entries", journalEntryRoutes);
app.use("/api/sales-invoices", salesInvoiceRoutes);
app.use("/api/purchase-invoices", purchaseInvoiceRoutes);

app.use("*", (req, res, next) => {
  next(
    new ApiError(
      404,
      `Route ${req.originalUrl} not found`,
      "ROUTE_NOT_FOUND"
    )
  );
});

app.use(errorHandler);

export default app;