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
import dashboardRoutes from "./routes/dashboardRoutes.js";
import systemLogRoutes from "./routes/systemLogRoutes.js";
import financialReportRoutes from "./routes/financialReportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import fiscalYearRoutes from "./routes/fiscalYearRoutes.js";
import numberingSeriesRoutes from "./routes/numberingSeriesRoutes.js";
import costCenterRoutes from "./routes/costCenterRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import taxRateRoutes from "./routes/taxRateRoutes.js";
import taxGroupRoutes from "./routes/taxGroupRoutes.js";
import gstrRoutes from "./routes/gstrRoutes.js";
import bankAccountRoutes from "./routes/bankAccountRoutes.js";
import bankTransactionRoutes from "./routes/bankTransactionRoutes.js";
import bankReconciliationRoutes from "./routes/bankReconciliationRoutes.js";
import assetCategoryRoutes from "./routes/assetCategoryRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import creditNoteRoutes from "./routes/creditNoteRoutes.js";
import debitNoteRoutes from "./routes/debitNoteRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import ApiError from "./utils/ApiError.js";

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
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
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/system-logs", systemLogRoutes);
app.use("/api/reports", financialReportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings/fiscal-years", fiscalYearRoutes);
app.use("/api/settings/numbering-series", numberingSeriesRoutes);
app.use("/api/cost-centers", costCenterRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/tax-rates", taxRateRoutes);
app.use("/api/tax-groups", taxGroupRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/bank-transactions", bankTransactionRoutes);
app.use("/api/bank-reconciliation", bankReconciliationRoutes);
app.use("/api/asset-categories", assetCategoryRoutes);app.use("/api/assets", assetRoutes);
app.use("/api/credit-notes", creditNoteRoutes);
app.use("/api/debit-notes", debitNoteRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/reports/gst", gstrRoutes);

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