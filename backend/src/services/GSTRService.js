import salesInvoiceRepository from "../repositories/SalesInvoiceRepository.js";
import purchaseInvoiceRepository from "../repositories/PurchaseInvoiceRepository.js";

class GSTRService {
  /**
   * GSTR-1: Outward supplies (sales) summary grouped by tax rate
   * Returns taxable value and tax amount for each tax rate/HSN
   */
  async getGSTR1({ startDate, endDate }) {
    const filter = { status: "Submitted" };
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await salesInvoiceRepository.find(filter, "customer");

    // Aggregate by tax type and rate
    const taxSummary = {};
    let totalTaxableValue = 0;
    let totalTaxAmount = 0;
    let totalInvoiceValue = 0;

    for (const inv of invoices) {
      totalInvoiceValue += inv.grandTotal;

      if (inv.taxBreakdown && inv.taxBreakdown.length > 0) {
        for (const tax of inv.taxBreakdown) {
          const key = `${tax.taxType}-${tax.rate}`;
          if (!taxSummary[key]) {
            taxSummary[key] = {
              taxType: tax.taxType,
              rate: tax.rate,
              taxName: tax.taxName,
              taxableValue: 0,
              taxAmount: 0,
              invoiceCount: 0,
            };
          }
          taxSummary[key].taxableValue += inv.subtotal;
          taxSummary[key].taxAmount += tax.amount;
          taxSummary[key].invoiceCount += 1;
          totalTaxableValue += inv.subtotal;
          totalTaxAmount += tax.amount;
        }
      } else {
        // No tax breakdown — group as "NIL" rated
        const key = "NIL-0";
        if (!taxSummary[key]) {
          taxSummary[key] = {
            taxType: "NIL",
            rate: 0,
            taxName: "Nil Rated / Non-GST",
            taxableValue: 0,
            taxAmount: 0,
            invoiceCount: 0,
          };
        }
        taxSummary[key].taxableValue += inv.subtotal;
        taxSummary[key].invoiceCount += 1;
        totalTaxableValue += inv.subtotal;
      }
    }

    return {
      summary: Object.values(taxSummary).map((s) => ({
        ...s,
        taxableValue: Math.round(s.taxableValue * 100) / 100,
        taxAmount: Math.round(s.taxAmount * 100) / 100,
      })),
      totals: {
        totalInvoices: invoices.length,
        totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
        totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
        totalInvoiceValue: Math.round(totalInvoiceValue * 100) / 100,
      },
      invoices,
    };
  }

  /**
   * GSTR-3B: Monthly summary return
   * Includes sales summary, purchase summary, tax liability, input tax credit
   */
  async getGSTR3B({ startDate, endDate }) {
    const filter = { status: "Submitted" };
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const [salesInvoices, purchaseInvoices] = await Promise.all([
      salesInvoiceRepository.find(filter, "customer"),
      purchaseInvoiceRepository.find(filter, "supplier"),
    ]);

    // Sales summary
    let salesTaxable = 0;
    let salesTax = 0;
    const outputTax = { cgst: 0, sgst: 0, igst: 0, cess: 0 };

    for (const inv of salesInvoices) {
      salesTaxable += inv.subtotal;
      if (inv.taxBreakdown) {
        for (const tax of inv.taxBreakdown) {
          salesTax += tax.amount;
          if (tax.taxType === "CGST") outputTax.cgst += tax.amount;
          else if (tax.taxType === "SGST") outputTax.sgst += tax.amount;
          else if (tax.taxType === "IGST") outputTax.igst += tax.amount;
          else if (tax.taxType === "CESS") outputTax.cess += tax.amount;
        }
      }
    }

    // Purchase summary
    let purchaseTaxable = 0;
    let purchaseTax = 0;
    const inputTax = { cgst: 0, sgst: 0, igst: 0, cess: 0 };

    for (const inv of purchaseInvoices) {
      purchaseTaxable += inv.subtotal;
      if (inv.taxBreakdown) {
        for (const tax of inv.taxBreakdown) {
          purchaseTax += tax.amount;
          if (tax.taxType === "CGST") inputTax.cgst += tax.amount;
          else if (tax.taxType === "SGST") inputTax.sgst += tax.amount;
          else if (tax.taxType === "IGST") inputTax.igst += tax.amount;
          else if (tax.taxType === "CESS") inputTax.cess += tax.amount;
        }
      }
    }

    return {
      period: { startDate, endDate },
      salesSummary: {
        totalInvoices: salesInvoices.length,
        taxableValue: Math.round(salesTaxable * 100) / 100,
        taxAmount: Math.round(salesTax * 100) / 100,
        outputTax: {
          cgst: Math.round(outputTax.cgst * 100) / 100,
          sgst: Math.round(outputTax.sgst * 100) / 100,
          igst: Math.round(outputTax.igst * 100) / 100,
          cess: Math.round(outputTax.cess * 100) / 100,
        },
      },
      purchaseSummary: {
        totalInvoices: purchaseInvoices.length,
        taxableValue: Math.round(purchaseTaxable * 100) / 100,
        taxAmount: Math.round(purchaseTax * 100) / 100,
        inputTax: {
          cgst: Math.round(inputTax.cgst * 100) / 100,
          sgst: Math.round(inputTax.sgst * 100) / 100,
          igst: Math.round(inputTax.igst * 100) / 100,
          cess: Math.round(inputTax.cess * 100) / 100,
        },
      },
      netTaxLiability: {
        cgst: Math.round((outputTax.cgst - inputTax.cgst) * 100) / 100,
        sgst: Math.round((outputTax.sgst - inputTax.sgst) * 100) / 100,
        igst: Math.round((outputTax.igst - inputTax.igst) * 100) / 100,
        cess: Math.round((outputTax.cess - inputTax.cess) * 100) / 100,
        total: Math.round((salesTax - purchaseTax) * 100) / 100,
      },
    };
  }
}

export default new GSTRService();
