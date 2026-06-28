package com.gstech.saas.accounting.reports.service;

import com.gstech.saas.accounting.reports.dto.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private static final Color COLOR_HEADER_BG  = new Color(30,  30,  30);   // near-black
    private static final Color COLOR_SECTION_BG = new Color(248, 248, 248);  // light grey
    private static final Color COLOR_BORDER      = new Color(209, 213, 219);  // gray-300
    private static final Color COLOR_RED         = new Color(220,  38,  38);
    private static final Color COLOR_GREEN       = new Color( 21, 128,  61);

    // ─── fonts ──────────────────────────────────────────────────────────────
    private static Font titleFont()    { return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLACK); }
    private static Font subFont()      { return FontFactory.getFont(FontFactory.HELVETICA,      10, new Color(107,114,128)); }
    private static Font headerFont()   { return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  Color.WHITE); }
    private static Font bodyFont()     { return FontFactory.getFont(FontFactory.HELVETICA,      9,  Color.BLACK); }
    private static Font boldFont()     { return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  Color.BLACK); }
    private static Font sectionFont()  { return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK); }
    private static Font redFont()      { return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  COLOR_RED); }
    private static Font greenFont()    { return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  COLOR_GREEN); }

    // ════════════════════════════════════════════════════════════════════════
    // BALANCE SHEET
    // ════════════════════════════════════════════════════════════════════════

    public byte[] balanceSheetPdf(BalanceSheetResponse r, String assocLabel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            addReportHeader(doc, assocLabel, "BALANCE SHEET",
                    "As of " + fmt(r.asOfDate()),
                    "Accounting Basis: " + r.accountingBasis());

            // Group assets into Current (< 1500) and Fixed (>= 1500)
            List<ReportLineItem> current = r.assets().stream()
                    .filter(i -> { try { return Integer.parseInt(i.accountCode()) < 1500; } catch (Exception e) { return true; } })
                    .toList();
            List<ReportLineItem> fixed = r.assets().stream()
                    .filter(i -> { try { return Integer.parseInt(i.accountCode()) >= 1500; } catch (Exception e) { return false; } })
                    .toList();

            addSectionTitle(doc, "ASSETS");
            if (!current.isEmpty()) {
                addSubSectionTitle(doc, "Current Assets");
                PdfPTable t = lineItemTable();
                current.forEach(i -> addLineItemRow(t, i.accountCode() + " - " + i.accountName(), i.balance(), false));
                addTotalRow(t, "Total Current Assets", sumItems(current), false);
                doc.add(t);
                doc.add(Chunk.NEWLINE);
            }
            if (!fixed.isEmpty()) {
                addSubSectionTitle(doc, "Fixed Assets");
                PdfPTable t = lineItemTable();
                fixed.forEach(i -> addLineItemRow(t, i.accountCode() + " - " + i.accountName(), i.balance(), false));
                addTotalRow(t, "Total Fixed Assets", sumItems(fixed), false);
                doc.add(t);
                doc.add(Chunk.NEWLINE);
            }
            addGrandTotalLine(doc, "TOTAL ASSETS", r.totalAssets());

            addSectionTitle(doc, "LIABILITIES");
            PdfPTable liabT = lineItemTable();
            r.liabilities().forEach(i -> addLineItemRow(liabT, i.accountCode() + " - " + i.accountName(), i.balance(), false));
            addTotalRow(liabT, "Total Liabilities", r.totalLiabilities(), false);
            doc.add(liabT);

            addSectionTitle(doc, "EQUITY");
            PdfPTable eqT = lineItemTable();
            r.equity().forEach(i -> addLineItemRow(eqT, i.accountCode() + " - " + i.accountName(), i.balance(), false));
            addTotalRow(eqT, "Total Equity", r.totalEquity(), false);
            doc.add(eqT);

            doc.add(Chunk.NEWLINE);
            addGrandTotalLine(doc, "TOTAL LIABILITIES & EQUITY",
                    r.totalLiabilities().add(r.totalEquity()));

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return out.toByteArray();
    }

    public String balanceSheetCsv(BalanceSheetResponse r, String assocLabel) {
        StringBuilder sb = new StringBuilder();
        sb.append("Balance Sheet\n");
        sb.append(assocLabel).append("\n");
        sb.append("As of ").append(fmt(r.asOfDate())).append("\n");
        sb.append("Accounting Basis: ").append(r.accountingBasis()).append("\n\n");

        // Current Assets
        sb.append("ASSETS\n\nCurrent Assets\n");
        sb.append("Account Code,Account Name,Balance\n");
        BigDecimal currentTotal = BigDecimal.ZERO;
        for (ReportLineItem i : r.assets()) {
            try {
                if (Integer.parseInt(i.accountCode()) < 1500) {
                    sb.append(csv(i.accountCode())).append(",").append(csv(i.accountName())).append(",").append(plain(i.balance())).append("\n");
                    currentTotal = currentTotal.add(i.balance());
                }
            } catch (Exception ex) {
                sb.append(csv(i.accountCode())).append(",").append(csv(i.accountName())).append(",").append(plain(i.balance())).append("\n");
                currentTotal = currentTotal.add(i.balance());
            }
        }
        sb.append(",,\nTotal Current Assets,,").append(plain(currentTotal)).append("\n\n");

        sb.append("Fixed Assets\nAccount Code,Account Name,Balance\n");
        BigDecimal fixedTotal = BigDecimal.ZERO;
        for (ReportLineItem i : r.assets()) {
            try {
                if (Integer.parseInt(i.accountCode()) >= 1500) {
                    sb.append(csv(i.accountCode())).append(",").append(csv(i.accountName())).append(",").append(plain(i.balance())).append("\n");
                    fixedTotal = fixedTotal.add(i.balance());
                }
            } catch (Exception ignored) { }
        }
        sb.append(",,\nTotal Fixed Assets,,").append(plain(fixedTotal)).append("\n\n");
        sb.append("TOTAL ASSETS,,").append(plain(r.totalAssets())).append("\n\n");

        sb.append("LIABILITIES\nAccount Code,Account Name,Balance\n");
        r.liabilities().forEach(i -> sb.append(csv(i.accountCode())).append(",").append(csv(i.accountName())).append(",").append(plain(i.balance())).append("\n"));
        sb.append(",,\nTotal Liabilities,,").append(plain(r.totalLiabilities())).append("\n\n");

        sb.append("EQUITY\nAccount Code,Account Name,Balance\n");
        r.equity().forEach(i -> sb.append(csv(i.accountCode())).append(",").append(csv(i.accountName())).append(",").append(plain(i.balance())).append("\n"));
        sb.append(",,\nTotal Equity,,").append(plain(r.totalEquity())).append("\n\n");
        sb.append("TOTAL LIABILITIES & EQUITY,,").append(plain(r.totalLiabilities().add(r.totalEquity()))).append("\n");
        return sb.toString();
    }

    // ════════════════════════════════════════════════════════════════════════
    // INCOME STATEMENT
    // ════════════════════════════════════════════════════════════════════════

    public byte[] incomeStatementPdf(IncomeStatementResponse r, String assocLabel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            addReportHeader(doc, assocLabel, "INCOME STATEMENT",
                    fmt(r.from()) + " to " + fmt(r.to()),
                    "Accounting Basis: " + r.accountingBasis());

            addSectionTitle(doc, "INCOME");
            PdfPTable incT = lineItemTable();
            r.revenue().forEach(i -> addLineItemRow(incT, i.accountCode() + " - " + i.accountName(), i.balance(), false));
            addTotalRow(incT, "Total Income", r.totalRevenue(), false);
            doc.add(incT);

            addSectionTitle(doc, "EXPENSES");
            PdfPTable expT = lineItemTable();
            r.expenses().forEach(i -> addLineItemRow(expT, i.accountCode() + " - " + i.accountName(), i.balance(), false));
            addTotalRow(expT, "Total Expenses", r.totalExpenses(), false);
            doc.add(expT);

            doc.add(Chunk.NEWLINE);
            PdfPTable netT = new PdfPTable(2);
            netT.setWidthPercentage(100);
            netT.setWidths(new float[]{4f, 1.5f});
            addTableCell(netT, "NET INCOME", boldFont(), Element.ALIGN_LEFT,  new Color(240,240,240), true);
            Font nf = r.netIncome().compareTo(BigDecimal.ZERO) >= 0 ? greenFont() : redFont();
            addTableCell(netT, fmtAmt(r.netIncome()), nf, Element.ALIGN_RIGHT, new Color(240,240,240), true);
            doc.add(netT);

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return out.toByteArray();
    }

    public String incomeStatementCsv(IncomeStatementResponse r, String assocLabel) {
        StringBuilder sb = new StringBuilder();
        sb.append("Income Statement\n").append(assocLabel).append("\n");
        sb.append(fmt(r.from())).append(" to ").append(fmt(r.to())).append("\n");
        sb.append("Accounting Basis: ").append(r.accountingBasis()).append("\n\n");
        sb.append("INCOME\nAccount Code,Account Name,Amount\n");
        r.revenue().forEach(i -> sb.append(csv(i.accountCode())).append(",").append(csv(i.accountName())).append(",").append(plain(i.balance())).append("\n"));
        sb.append(",,\nTotal Income,,").append(plain(r.totalRevenue())).append("\n\n");
        sb.append("EXPENSES\nAccount Code,Account Name,Amount\n");
        r.expenses().forEach(i -> sb.append(csv(i.accountCode())).append(",").append(csv(i.accountName())).append(",").append(plain(i.balance())).append("\n"));
        sb.append(",,\nTotal Expenses,,").append(plain(r.totalExpenses())).append("\n\n");
        sb.append("NET INCOME,,").append(plain(r.netIncome())).append("\n");
        return sb.toString();
    }

    // ════════════════════════════════════════════════════════════════════════
    // TRIAL BALANCE
    // ════════════════════════════════════════════════════════════════════════

    public byte[] trialBalancePdf(TrialBalanceResponse r, String assocLabel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            addReportHeader(doc, assocLabel, "TRIAL BALANCE",
                    fmt(r.from()) + " to " + fmt(r.to()),
                    "Accounting Basis: " + r.accountingBasis());

            PdfPTable t = new PdfPTable(4);
            t.setWidthPercentage(100);
            t.setWidths(new float[]{1.2f, 3f, 1.5f, 1.5f});

            addHeaderCell(t, "Account Code");
            addHeaderCell(t, "Account Name");
            addHeaderCell(t, "Debit Balance");
            addHeaderCell(t, "Credit Balance");

            for (TrialBalanceRow row : r.accounts()) {
                addBodyCell(t, row.accountCode(), Element.ALIGN_LEFT);
                addBodyCell(t, row.accountName(), Element.ALIGN_LEFT);
                addBodyCell(t, fmtAmt(row.totalDebit()),  Element.ALIGN_RIGHT);
                addBodyCell(t, fmtAmt(row.totalCredit()), Element.ALIGN_RIGHT);
            }

            // Total row
            addTotalCellSpan(t, "TOTAL", 2);
            PdfPCell debitCell = new PdfPCell(new Phrase(fmtAmt(r.totalDebits()), boldFont()));
            debitCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            debitCell.setBorderColor(COLOR_BORDER);
            debitCell.setPadding(5);
            debitCell.setBackgroundColor(COLOR_SECTION_BG);
            t.addCell(debitCell);
            PdfPCell creditCell = new PdfPCell(new Phrase(fmtAmt(r.totalCredits()), boldFont()));
            creditCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            creditCell.setBorderColor(COLOR_BORDER);
            creditCell.setPadding(5);
            creditCell.setBackgroundColor(COLOR_SECTION_BG);
            t.addCell(creditCell);

            doc.add(t);
            doc.add(Chunk.NEWLINE);

            Font balFont = r.isBalanced() ? greenFont() : redFont();
            String balMsg = r.isBalanced() ? "✓ Trial Balance is in balance" : "⚠ Trial Balance is OUT OF BALANCE";
            doc.add(new Paragraph(balMsg, balFont));

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return out.toByteArray();
    }

    public String trialBalanceCsv(TrialBalanceResponse r, String assocLabel) {
        StringBuilder sb = new StringBuilder();
        sb.append("Trial Balance\n").append(assocLabel).append("\n");
        sb.append(fmt(r.from())).append(" to ").append(fmt(r.to())).append("\n");
        sb.append("Accounting Basis: ").append(r.accountingBasis()).append("\n\n");
        sb.append("Account Code,Account Name,Debit Balance,Credit Balance\n");
        r.accounts().forEach(row -> sb.append(csv(row.accountCode())).append(",")
                .append(csv(row.accountName())).append(",")
                .append(plain(row.totalDebit())).append(",")
                .append(plain(row.totalCredit())).append("\n"));
        sb.append("\nTOTAL,,").append(plain(r.totalDebits())).append(",").append(plain(r.totalCredits())).append("\n\n");
        sb.append(r.isBalanced() ? "Trial Balance is in balance" : "WARNING: Trial Balance is OUT OF BALANCE").append("\n");
        return sb.toString();
    }

    // ════════════════════════════════════════════════════════════════════════
    // CASH FLOW
    // ════════════════════════════════════════════════════════════════════════

    public byte[] cashFlowPdf(CashFlowResponse r, String assocLabel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            addReportHeader(doc, assocLabel, "CASH FLOW STATEMENT",
                    fmt(r.from()) + " to " + fmt(r.to()),
                    "Accounting Basis: " + r.accountingBasis());

            addCashFlowSection(doc, "CASH FLOWS FROM OPERATING ACTIVITIES",
                    r.operating(), "Net Cash from Operating Activities", r.netCashFromOperating());
            addCashFlowSection(doc, "CASH FLOWS FROM INVESTING ACTIVITIES",
                    r.investing(), "Net Cash from Investing Activities", r.netCashFromInvesting());
            addCashFlowSection(doc, "CASH FLOWS FROM FINANCING ACTIVITIES",
                    r.financing(), "Net Cash from Financing Activities", r.netCashFromFinancing());

            doc.add(Chunk.NEWLINE);
            PdfPTable netT = new PdfPTable(2);
            netT.setWidthPercentage(100);
            netT.setWidths(new float[]{4f, 1.5f});
            addTableCell(netT, "NET CHANGE IN CASH", boldFont(), Element.ALIGN_LEFT,  new Color(240,240,240), true);
            addTableCell(netT, fmtAmt(r.netChangeInCash()), boldFont(), Element.ALIGN_RIGHT, new Color(240,240,240), true);
            doc.add(netT);
            doc.add(Chunk.NEWLINE);

            PdfPTable closingT = new PdfPTable(2);
            closingT.setWidthPercentage(100);
            closingT.setWidths(new float[]{4f, 1.5f});
            addTableCell(closingT, "Cash at Beginning of Period", bodyFont(), Element.ALIGN_LEFT,  Color.WHITE, false);
            addTableCell(closingT, fmtAmt(r.openingCashBalance()), bodyFont(), Element.ALIGN_RIGHT, Color.WHITE, false);
            addTableCell(closingT, "Cash at End of Period", bodyFont(), Element.ALIGN_LEFT,  Color.WHITE, false);
            addTableCell(closingT, fmtAmt(r.closingCashBalance()), bodyFont(), Element.ALIGN_RIGHT, Color.WHITE, false);
            doc.add(closingT);

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return out.toByteArray();
    }

    public String cashFlowCsv(CashFlowResponse r, String assocLabel) {
        StringBuilder sb = new StringBuilder();
        sb.append("Cash Flow Statement\n").append(assocLabel).append("\n");
        sb.append(fmt(r.from())).append(" to ").append(fmt(r.to())).append("\n");
        sb.append("Accounting Basis: ").append(r.accountingBasis()).append("\n\n");
        appendCashFlowSection(sb, "CASH FLOWS FROM OPERATING ACTIVITIES", r.operating(), "Net Cash from Operating Activities", r.netCashFromOperating());
        appendCashFlowSection(sb, "CASH FLOWS FROM INVESTING ACTIVITIES",  r.investing(),  "Net Cash from Investing Activities",  r.netCashFromInvesting());
        appendCashFlowSection(sb, "CASH FLOWS FROM FINANCING ACTIVITIES",  r.financing(),  "Net Cash from Financing Activities",  r.netCashFromFinancing());
        sb.append("NET CHANGE IN CASH,").append(plain(r.netChangeInCash())).append("\n\n");
        sb.append("Cash at Beginning of Period,").append(plain(r.openingCashBalance())).append("\n");
        sb.append("Cash at End of Period,").append(plain(r.closingCashBalance())).append("\n");
        return sb.toString();
    }

    // ════════════════════════════════════════════════════════════════════════
    // BUDGET VS ACTUAL
    // ════════════════════════════════════════════════════════════════════════

    public byte[] budgetVsActualPdf(BudgetVsActualResponse r, String assocLabel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 40, 40, 50, 50); // landscape
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            addReportHeader(doc, assocLabel, "BUDGET VS ACTUAL REPORT",
                    "Budget: " + r.budgetName() + " | Period: " + fmt(r.from()) + " to " + fmt(r.to()),
                    "Accounting Basis: " + r.accountingBasis());

            // INCOME
            addSectionTitle(doc, "INCOME");
            doc.add(buildBVATable(r.incomeRows(), true));
            addBVATotalRow(doc, "Total Income", r.totalBudgetedIncome(), r.totalActualIncome());

            // EXPENSES
            addSectionTitle(doc, "EXPENSES");
            doc.add(buildBVATable(r.expenseRows(), false));
            addBVATotalRow(doc, "Total Expenses", r.totalBudgetedExpenses(), r.totalActualExpenses());

            doc.add(Chunk.NEWLINE);
            addBVANetRow(doc, r.budgetedNetIncome(), r.actualNetIncome());

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return out.toByteArray();
    }

    public String budgetVsActualCsv(BudgetVsActualResponse r, String assocLabel) {
        StringBuilder sb = new StringBuilder();
        sb.append("Budget vs Actual Report\n").append(assocLabel).append("\n");
        sb.append("Budget: ").append(csv(r.budgetName())).append("\n");
        sb.append("Period: ").append(fmt(r.from())).append(" to ").append(fmt(r.to())).append("\n");
        sb.append("Accounting Basis: ").append(r.accountingBasis()).append("\n\n");
        sb.append("INCOME\nAccount Code,Account Name,Budgeted,Actual,Variance,Variance %\n");
        r.incomeRows().forEach(row -> sb.append(csv(row.accountCode())).append(",").append(csv(row.accountName()))
                .append(",").append(plain(row.budgetedAmount())).append(",").append(plain(row.actualAmount()))
                .append(",").append(plain(row.variance())).append(",").append(plain2(row.variancePercentage())).append("%\n"));
        sb.append(",,,,\nTotal Income,,").append(plain(r.totalBudgetedIncome())).append(",").append(plain(r.totalActualIncome())).append(",").append(plain(r.totalBudgetedIncome().subtract(r.totalActualIncome()))).append("\n\n");
        sb.append("EXPENSES\nAccount Code,Account Name,Budgeted,Actual,Variance,Variance %\n");
        r.expenseRows().forEach(row -> sb.append(csv(row.accountCode())).append(",").append(csv(row.accountName()))
                .append(",").append(plain(row.budgetedAmount())).append(",").append(plain(row.actualAmount()))
                .append(",").append(plain(row.variance())).append(",").append(plain2(row.variancePercentage())).append("%\n"));
        sb.append(",,,,\nTotal Expenses,,").append(plain(r.totalBudgetedExpenses())).append(",").append(plain(r.totalActualExpenses())).append(",").append(plain(r.totalBudgetedExpenses().subtract(r.totalActualExpenses()))).append("\n\n");
        sb.append("NET INCOME,,").append(plain(r.budgetedNetIncome())).append(",").append(plain(r.actualNetIncome())).append(",").append(plain(r.budgetedNetIncome().subtract(r.actualNetIncome()))).append("\n");
        return sb.toString();
    }

    // ════════════════════════════════════════════════════════════════════════
    // VENDOR LEDGER
    // ════════════════════════════════════════════════════════════════════════

    public byte[] vendorLedgerPdf(VendorLedgerResponse r, String assocLabel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 40, 40, 50, 50);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            addReportHeader(doc, assocLabel, "VENDOR LEDGER REPORT",
                    fmt(r.from()) + " to " + fmt(r.to()), null);

            if (r.vendors() == null || r.vendors().isEmpty()) {
                doc.add(new Paragraph("No vendor transactions found for the selected period.", subFont()));
            } else {
                for (VendorLedgerGroup group : r.vendors()) {
                    doc.add(Chunk.NEWLINE);
                    Paragraph vendorTitle = new Paragraph(group.vendorName() + " — " + group.serviceCategory(), sectionFont());
                    doc.add(vendorTitle);

                    PdfPTable t = new PdfPTable(6);
                    t.setWidthPercentage(100);
                    t.setWidths(new float[]{1.5f, 1.5f, 3f, 1.5f, 1.2f, 1.5f});
                    addHeaderCell(t, "Date");
                    addHeaderCell(t, "Bill #");
                    addHeaderCell(t, "Description");
                    addHeaderCell(t, "Amount");
                    addHeaderCell(t, "Status");
                    addHeaderCell(t, "Balance");

                    for (VendorLedgerRow tx : group.transactions()) {
                        addBodyCell(t, tx.date() != null ? tx.date().toString() : "", Element.ALIGN_LEFT);
                        addBodyCell(t, tx.billNumber() != null ? tx.billNumber() : "", Element.ALIGN_LEFT);
                        addBodyCell(t, tx.description() != null ? tx.description() : "", Element.ALIGN_LEFT);
                        addBodyCell(t, fmtAmt(tx.amount()), Element.ALIGN_RIGHT);
                        addBodyCell(t, tx.status(), Element.ALIGN_CENTER);
                        addBodyCell(t, fmtAmt(tx.runningBalance()), Element.ALIGN_RIGHT);
                    }
                    doc.add(t);

                    PdfPTable summaryT = new PdfPTable(3);
                    summaryT.setWidthPercentage(60);
                    summaryT.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    addTableCell(summaryT, "Total Billed: " + fmtAmt(group.totalBilled()),   bodyFont(), Element.ALIGN_RIGHT, COLOR_SECTION_BG, false);
                    addTableCell(summaryT, "Total Paid: "   + fmtAmt(group.totalPaid()),     bodyFont(), Element.ALIGN_RIGHT, COLOR_SECTION_BG, false);
                    addTableCell(summaryT, "Balance: "      + fmtAmt(group.closingBalance()), boldFont(), Element.ALIGN_RIGHT, COLOR_SECTION_BG, false);
                    doc.add(summaryT);
                }
            }

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }
        return out.toByteArray();
    }

    public String vendorLedgerCsv(VendorLedgerResponse r) {
        StringBuilder sb = new StringBuilder();
        sb.append("Vendor Ledger Report\n");
        sb.append(fmt(r.from())).append(" to ").append(fmt(r.to())).append("\n\n");
        if (r.vendors() != null) {
            for (VendorLedgerGroup group : r.vendors()) {
                sb.append(csv(group.vendorName())).append(",").append(csv(group.serviceCategory() != null ? group.serviceCategory() : "")).append("\n");
                sb.append("Date,Bill #,Description,Amount,Status,Running Balance\n");
                group.transactions().forEach(tx -> sb
                        .append(tx.date() != null ? tx.date().toString() : "").append(",")
                        .append(csv(tx.billNumber() != null ? tx.billNumber() : "")).append(",")
                        .append(csv(tx.description() != null ? tx.description() : "")).append(",")
                        .append(plain(tx.amount())).append(",")
                        .append(csv(tx.status())).append(",")
                        .append(plain(tx.runningBalance())).append("\n"));
                sb.append(",Total Billed,").append(plain(group.totalBilled()))
                        .append(",Total Paid,").append(plain(group.totalPaid()))
                        .append(",Balance,").append(plain(group.closingBalance())).append("\n\n");
            }
        }
        return sb.toString();
    }

    // ════════════════════════════════════════════════════════════════════════
    // PDF HELPER METHODS
    // ════════════════════════════════════════════════════════════════════════

    private void addReportHeader(Document doc, String assocLabel, String title,
                                 String line1, String line2) throws DocumentException {
        doc.add(new Paragraph(assocLabel, titleFont()));
        Paragraph t = new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK));
        doc.add(t);
        if (line1 != null) doc.add(new Paragraph(line1, subFont()));
        if (line2 != null) doc.add(new Paragraph(line2, subFont()));
        doc.add(Chunk.NEWLINE);
    }

    private void addSectionTitle(Document doc, String title) throws DocumentException {
        doc.add(Chunk.NEWLINE);
        doc.add(new Paragraph(title, sectionFont()));
    }

    private void addSubSectionTitle(Document doc, String title) throws DocumentException {
        Font f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(75, 85, 99));
        doc.add(new Paragraph(title, f));
    }

    private PdfPTable lineItemTable() throws DocumentException {
        PdfPTable t = new PdfPTable(2);
        t.setWidthPercentage(100);
        t.setWidths(new float[]{5f, 1.5f});
        return t;
    }

    private void addLineItemRow(PdfPTable t, String name, BigDecimal amount, boolean bold) {
        Font f = bold ? boldFont() : bodyFont();
        PdfPCell nameCell = new PdfPCell(new Phrase("  " + name, f));
        nameCell.setBorderColor(COLOR_BORDER);
        nameCell.setPadding(5);
        nameCell.setBorder(Rectangle.BOTTOM);
        t.addCell(nameCell);

        PdfPCell amtCell = new PdfPCell(new Phrase(fmtAmt(amount), f));
        amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        amtCell.setBorderColor(COLOR_BORDER);
        amtCell.setPadding(5);
        amtCell.setBorder(Rectangle.BOTTOM);
        t.addCell(amtCell);
    }

    private void addTotalRow(PdfPTable t, String label, BigDecimal amount, boolean grand) {
        Font f = boldFont();
        Color bg = grand ? new Color(240,240,240) : COLOR_SECTION_BG;
        addTableCell(t, label,           f, Element.ALIGN_LEFT,  bg, true);
        addTableCell(t, fmtAmt(amount),  f, Element.ALIGN_RIGHT, bg, true);
    }

    private void addGrandTotalLine(Document doc, String label, BigDecimal amount) throws DocumentException {
        PdfPTable t = new PdfPTable(2);
        t.setWidthPercentage(100);
        t.setWidths(new float[]{5f, 1.5f});
        addTableCell(t, label,           boldFont(), Element.ALIGN_LEFT,  new Color(220,220,220), true);
        addTableCell(t, fmtAmt(amount),  boldFont(), Element.ALIGN_RIGHT, new Color(220,220,220), true);
        doc.add(t);
    }

    private void addCashFlowSection(Document doc, String title, List<CashFlowRow> rows,
                                    String netLabel, BigDecimal net) throws DocumentException {
        addSectionTitle(doc, title);
        PdfPTable t = new PdfPTable(2);
        t.setWidthPercentage(100);
        t.setWidths(new float[]{5f, 1.5f});

        if (rows == null || rows.isEmpty()) {
            addTableCell(t, "  No " + title.toLowerCase().replace("cash flows from ", "") + " activities",
                    bodyFont(), Element.ALIGN_LEFT, Color.WHITE, false);
            addTableCell(t, fmtAmt(BigDecimal.ZERO), bodyFont(), Element.ALIGN_RIGHT, Color.WHITE, false);
        } else {
            for (CashFlowRow row : rows) {
                Font f = row.amount().compareTo(BigDecimal.ZERO) < 0 ? redFont() : bodyFont();
                addTableCell(t, "  " + row.description(), bodyFont(), Element.ALIGN_LEFT, Color.WHITE, false);
                addTableCell(t, fmtAmt(row.amount()), f, Element.ALIGN_RIGHT, Color.WHITE, false);
            }
        }
        addTotalRow(t, netLabel, net, false);
        doc.add(t);
    }

    private PdfPTable buildBVATable(List<BudgetVsActualRow> rows, boolean isIncome) throws DocumentException {
        PdfPTable t = new PdfPTable(6);
        t.setWidthPercentage(100);
        t.setWidths(new float[]{1.2f, 3f, 1.5f, 1.5f, 1.5f, 1.2f});
        addHeaderCell(t, "Account Code");
        addHeaderCell(t, "Account Name");
        addHeaderCell(t, "Budgeted");
        addHeaderCell(t, "Actual");
        addHeaderCell(t, "Variance");
        addHeaderCell(t, "%");

        for (BudgetVsActualRow row : rows) {
            boolean isGood = isIncome
                    ? row.actualAmount().compareTo(row.budgetedAmount()) >= 0
                    : row.actualAmount().compareTo(row.budgetedAmount()) <= 0;
            Font varFont = isGood ? greenFont() : redFont();

            addBodyCell(t, row.accountCode(),           Element.ALIGN_LEFT);
            addBodyCell(t, row.accountName(),           Element.ALIGN_LEFT);
            addBodyCell(t, fmtAmt(row.budgetedAmount()), Element.ALIGN_RIGHT);
            addBodyCell(t, fmtAmt(row.actualAmount()),   Element.ALIGN_RIGHT);
            PdfPCell varCell = new PdfPCell(new Phrase(fmtAmt(row.variance()), varFont));
            varCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            varCell.setBorderColor(COLOR_BORDER); varCell.setPadding(5); varCell.setBorder(Rectangle.BOTTOM);
            t.addCell(varCell);
            PdfPCell pctCell = new PdfPCell(new Phrase(plain2(row.variancePercentage()) + "%", varFont));
            pctCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            pctCell.setBorderColor(COLOR_BORDER); pctCell.setPadding(5); pctCell.setBorder(Rectangle.BOTTOM);
            t.addCell(pctCell);
        }
        return t;
    }

    private void addBVATotalRow(Document doc, String label, BigDecimal budgeted, BigDecimal actual) throws DocumentException {
        PdfPTable t = new PdfPTable(6);
        t.setWidthPercentage(100);
        t.setWidths(new float[]{1.2f, 3f, 1.5f, 1.5f, 1.5f, 1.2f});
        addTableCell(t, label,         boldFont(), Element.ALIGN_LEFT,  COLOR_SECTION_BG, true);
        addTableCell(t, "",            boldFont(), Element.ALIGN_LEFT,  COLOR_SECTION_BG, true);
        addTableCell(t, fmtAmt(budgeted), boldFont(), Element.ALIGN_RIGHT, COLOR_SECTION_BG, true);
        addTableCell(t, fmtAmt(actual),   boldFont(), Element.ALIGN_RIGHT, COLOR_SECTION_BG, true);
        addTableCell(t, "",            boldFont(), Element.ALIGN_LEFT,  COLOR_SECTION_BG, true);
        addTableCell(t, "",            boldFont(), Element.ALIGN_LEFT,  COLOR_SECTION_BG, true);
        doc.add(t);
    }

    private void addBVANetRow(Document doc, BigDecimal budgetedNet, BigDecimal actualNet) throws DocumentException {
        BigDecimal variance = budgetedNet.subtract(actualNet);
        Font varFont = variance.compareTo(BigDecimal.ZERO) >= 0 ? greenFont() : redFont();
        PdfPTable t = new PdfPTable(6);
        t.setWidthPercentage(100);
        t.setWidths(new float[]{1.2f, 3f, 1.5f, 1.5f, 1.5f, 1.2f});
        addTableCell(t, "NET INCOME",        boldFont(), Element.ALIGN_LEFT,  new Color(230,230,230), true);
        addTableCell(t, "",                  boldFont(), Element.ALIGN_LEFT,  new Color(230,230,230), true);
        addTableCell(t, fmtAmt(budgetedNet), boldFont(), Element.ALIGN_RIGHT, new Color(230,230,230), true);
        addTableCell(t, fmtAmt(actualNet),   boldFont(), Element.ALIGN_RIGHT, new Color(230,230,230), true);
        PdfPCell vCell = new PdfPCell(new Phrase(fmtAmt(variance), varFont));
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT); vCell.setBorderColor(COLOR_BORDER);
        vCell.setPadding(5); vCell.setBackgroundColor(new Color(230,230,230));
        t.addCell(vCell);
        addTableCell(t, "", boldFont(), Element.ALIGN_LEFT, new Color(230,230,230), true);
        doc.add(t);
    }

    private void addHeaderCell(PdfPTable t, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont()));
        cell.setBackgroundColor(COLOR_HEADER_BG);
        cell.setBorderColor(COLOR_HEADER_BG);
        cell.setPadding(6);
        t.addCell(cell);
    }

    private void addBodyCell(PdfPTable t, String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, bodyFont()));
        cell.setHorizontalAlignment(alignment);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(5);
        cell.setBorder(Rectangle.BOTTOM);
        t.addCell(cell);
    }

    private void addTableCell(PdfPTable t, String text, Font font, int alignment, Color bg, boolean bold) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(5);
        t.addCell(cell);
    }

    private void addTotalCellSpan(PdfPTable t, String text, int colspan) {
        PdfPCell cell = new PdfPCell(new Phrase(text, boldFont()));
        cell.setColspan(colspan);
        cell.setBackgroundColor(COLOR_SECTION_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(5);
        t.addCell(cell);
    }

    // ════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ════════════════════════════════════════════════════════════════════════

    private void appendCashFlowSection(StringBuilder sb, String title, List<CashFlowRow> rows,
                                       String netLabel, BigDecimal net) {
        sb.append(title).append("\nDescription,Amount\n");
        if (rows == null || rows.isEmpty()) {
            sb.append("No ").append(title.toLowerCase().replace("cash flows from ", "")).append(" activities,").append(plain(BigDecimal.ZERO)).append("\n");
        } else {
            rows.forEach(r -> sb.append(csv(r.description())).append(",").append(plain(r.amount())).append("\n"));
        }
        sb.append("\n").append(netLabel).append(",").append(plain(net)).append("\n\n");
    }

    private String fmt(LocalDate d)      { return d != null ? d.format(DATE_FMT) : ""; }
    private String fmtAmt(BigDecimal n)  { return n != null ? String.format("$%,.2f", n) : "$0.00"; }
    private String plain(BigDecimal n)   { return n != null ? n.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString() : "0.00"; }
    private String plain2(BigDecimal n)  { return n != null ? String.format("%.1f", n) : "0.0"; }
    private String csv(String s)         { return "\"" + (s != null ? s.replace("\"", "\"\"") : "") + "\""; }
    private BigDecimal sumItems(List<ReportLineItem> items) {
        return items.stream().map(ReportLineItem::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}