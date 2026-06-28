// FILE: src/modules/reports/api/financialReportsApi.js
import httpClient from "@/api/httpClient";
import { getAccessToken } from "@/shared/utils/storage";

// ── Date range resolver ───────────────────────────────────────────────────────
export function resolveDateRange(preset) {
  const today = new Date();
  const iso   = (d) => d.toISOString().split("T")[0];
  const qStart = (d) => { const q = Math.floor(d.getMonth() / 3); return new Date(d.getFullYear(), q * 3, 1); };
  const qEnd   = (d) => { const q = Math.floor(d.getMonth() / 3); return new Date(d.getFullYear(), q * 3 + 3, 0); };

  switch (preset) {
    case "THIS_QUARTER": return { from: iso(qStart(today)), to: iso(qEnd(today)) };
    case "LAST_QUARTER": { const lq = new Date(today.getFullYear(), today.getMonth() - 3, 1); return { from: iso(qStart(lq)), to: iso(qEnd(lq)) }; }
    case "THIS_YEAR":    return { from: iso(new Date(today.getFullYear(), 0, 1)), to: iso(today) };
    case "LAST_YEAR":    return { from: iso(new Date(today.getFullYear() - 1, 0, 1)), to: iso(new Date(today.getFullYear() - 1, 11, 31)) };
    case "THIS_MONTH":   return { from: iso(new Date(today.getFullYear(), today.getMonth(), 1)), to: iso(today) };
    case "LAST_MONTH":   { const f = new Date(today.getFullYear(), today.getMonth() - 1, 1); return { from: iso(f), to: iso(new Date(today.getFullYear(), today.getMonth(), 0)) }; }
    case "LAST_90_DAYS": { const f = new Date(today); f.setDate(f.getDate() - 90); return { from: iso(f), to: iso(today) }; }
    default:             return { from: null, to: null };
  }
}

// ── JSON endpoints ────────────────────────────────────────────────────────────

export const getBalanceSheet = ({ associationId, asOfDate, accountingBasis }) =>
  httpClient.get("/api/v1/reports/financial/balance-sheet", {
    params: { ...(associationId ? { associationId } : {}), ...(asOfDate ? { asOfDate } : {}), ...(accountingBasis ? { accountingBasis } : {}) },
  });

export const getIncomeStatement = ({ associationId, from, to, accountingBasis, accountSelection }) =>
  httpClient.get("/api/v1/reports/financial/income-statement", {
    params: { ...(associationId ? { associationId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}), ...(accountingBasis ? { accountingBasis } : {}), ...(accountSelection ? { accountSelection } : {}) },
  });

export const getTrialBalance = ({ associationId, from, to, accountingBasis }) =>
  httpClient.get("/api/v1/reports/financial/trial-balance", {
    params: { ...(associationId ? { associationId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}), ...(accountingBasis ? { accountingBasis } : {}) },
  });

export const getCashFlow = ({ associationId, from, to, accountingBasis }) =>
  httpClient.get("/api/v1/reports/financial/cash-flow", {
    params: { ...(associationId ? { associationId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}), ...(accountingBasis ? { accountingBasis } : {}) },
  });

export const getVendorLedger = ({ associationId, vendorId, from, to }) =>
  httpClient.get("/api/v1/reports/financial/vendor-ledger", {
    params: { ...(associationId ? { associationId } : {}), ...(vendorId ? { vendorId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) },
  });

export const getBudgetVsActual = ({ budgetId, accountingBasis, from, to }) =>
  httpClient.get("/api/v1/reports/financial/budget-vs-actual", {
    params: { budgetId, ...(accountingBasis ? { accountingBasis } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) },
  });

export const getBudgets = (associationId) =>
  httpClient.get("/api/v1/accounting/budgets", { params: associationId ? { associationId } : {} });

// ── File download helper ──────────────────────────────────────────────────────
// Uses fetch() directly with the Bearer token so the browser triggers a file download.
function buildExportUrl(path, params) {
  const base   = import.meta.env.VITE_API_BASE_URL || "";
  const url    = new URL(base + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") url.searchParams.set(k, v); });
  return url.toString();
}

async function triggerDownload(url, fallbackFilename) {
  const token = getAccessToken();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);

  // Extract filename from Content-Disposition if present
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";\n]+)"?/i);
  const filename = match ? match[1] : fallbackFilename;

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

// ── PDF export functions ──────────────────────────────────────────────────────

export async function downloadBalanceSheetPdf({ associationId, asOfDate, accountingBasis }) {
  const url = buildExportUrl("/api/v1/reports/financial/balance-sheet/export/pdf", { associationId, asOfDate, accountingBasis });
  await triggerDownload(url, "balance-sheet.pdf");
}

export async function downloadBalanceSheetCsv({ associationId, asOfDate, accountingBasis }) {
  const url = buildExportUrl("/api/v1/reports/financial/balance-sheet/export/csv", { associationId, asOfDate, accountingBasis });
  await triggerDownload(url, "balance-sheet.csv");
}

export async function downloadIncomeStatementPdf({ associationId, from, to, accountingBasis, accountSelection }) {
  const url = buildExportUrl("/api/v1/reports/financial/income-statement/export/pdf", { associationId, from, to, accountingBasis, accountSelection });
  await triggerDownload(url, "income-statement.pdf");
}

export async function downloadIncomeStatementCsv({ associationId, from, to, accountingBasis, accountSelection }) {
  const url = buildExportUrl("/api/v1/reports/financial/income-statement/export/csv", { associationId, from, to, accountingBasis, accountSelection });
  await triggerDownload(url, "income-statement.csv");
}

export async function downloadTrialBalancePdf({ associationId, from, to, accountingBasis }) {
  const url = buildExportUrl("/api/v1/reports/financial/trial-balance/export/pdf", { associationId, from, to, accountingBasis });
  await triggerDownload(url, "trial-balance.pdf");
}

export async function downloadTrialBalanceCsv({ associationId, from, to, accountingBasis }) {
  const url = buildExportUrl("/api/v1/reports/financial/trial-balance/export/csv", { associationId, from, to, accountingBasis });
  await triggerDownload(url, "trial-balance.csv");
}

export async function downloadCashFlowPdf({ associationId, from, to, accountingBasis }) {
  const url = buildExportUrl("/api/v1/reports/financial/cash-flow/export/pdf", { associationId, from, to, accountingBasis });
  await triggerDownload(url, "cash-flow-statement.pdf");
}

export async function downloadCashFlowCsv({ associationId, from, to, accountingBasis }) {
  const url = buildExportUrl("/api/v1/reports/financial/cash-flow/export/csv", { associationId, from, to, accountingBasis });
  await triggerDownload(url, "cash-flow-statement.csv");
}

export async function downloadVendorLedgerPdf({ associationId, vendorId, from, to }) {
  const url = buildExportUrl("/api/v1/reports/financial/vendor-ledger/export/pdf", { associationId, vendorId, from, to });
  await triggerDownload(url, "vendor-ledger.pdf");
}

export async function downloadVendorLedgerCsv({ associationId, vendorId, from, to }) {
  const url = buildExportUrl("/api/v1/reports/financial/vendor-ledger/export/csv", { associationId, vendorId, from, to });
  await triggerDownload(url, "vendor-ledger.csv");
}

export async function downloadBudgetVsActualPdf({ budgetId, accountingBasis, from, to }) {
  const url = buildExportUrl("/api/v1/reports/financial/budget-vs-actual/export/pdf", { budgetId, accountingBasis, from, to });
  await triggerDownload(url, "budget-vs-actual.pdf");
}

export async function downloadBudgetVsActualCsv({ budgetId, accountingBasis, from, to }) {
  const url = buildExportUrl("/api/v1/reports/financial/budget-vs-actual/export/csv", { budgetId, accountingBasis, from, to });
  await triggerDownload(url, "budget-vs-actual.csv");
}

// ── Association Reports ────────────────────────────────────────────────────────
export const getVendorSpending = ({ associationId, from, to }) =>
  httpClient.get("/api/v1/reports/association/vendor-spending", { params: { ...(associationId ? { associationId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) } });

export const getAssessmentHistory = ({ associationId, from, to }) =>
  httpClient.get("/api/v1/reports/association/assessment-history", { params: { ...(associationId ? { associationId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) } });

export const getUnitOwnerStatement = ({ associationId, unitId, from, to }) =>
  httpClient.get("/api/v1/reports/association/unit-owner-statement", { params: { ...(associationId ? { associationId } : {}), ...(unitId ? { unitId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) } });

export const getFinancialSummary = ({ associationId, from, to }) =>
  httpClient.get("/api/v1/reports/association/financial-summary", { params: { ...(associationId ? { associationId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) } });

export const getUnitOccupancy = ({ associationId, dateRange = "CURRENT" }) =>
  httpClient.get("/api/v1/reports/association/unit-occupancy", { params: { ...(associationId ? { associationId } : {}), dateRange } });

export const getDelinquency = ({ associationId, agingPeriod = "ALL" }) =>
  httpClient.get("/api/v1/reports/association/delinquency", { params: { ...(associationId ? { associationId } : {}), agingPeriod } });