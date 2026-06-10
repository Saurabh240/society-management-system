import httpClient from "@/api/httpClient";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolves a dateRange preset string to { from, to } ISO dates.
 * Called client-side before sending to the API so the server always
 * receives concrete dates rather than CUSTOM with nulls.
 */
export function resolveDateRange(preset) {
  const today   = new Date();
  const isoDate = (d) => d.toISOString().split("T")[0];

  const startOfYear = () => new Date(today.getFullYear(), 0, 1);
  const endOfYear   = () => new Date(today.getFullYear(), 11, 31);

  const quarterStart = (date) => {
    const q = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), q * 3, 1);
  };
  const quarterEnd = (date) => {
    const q = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), q * 3 + 3, 0);
  };

  switch (preset) {
    case "THIS_QUARTER":
      return { from: isoDate(quarterStart(today)), to: isoDate(quarterEnd(today)) };
    case "LAST_QUARTER": {
      const lq = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      return { from: isoDate(quarterStart(lq)), to: isoDate(quarterEnd(lq)) };
    }
    case "THIS_YEAR":
      return { from: isoDate(startOfYear()), to: isoDate(today) };
    case "LAST_YEAR": {
      const ly = new Date(today.getFullYear() - 1, 0, 1);
      return {
        from: isoDate(ly),
        to:   isoDate(new Date(today.getFullYear() - 1, 11, 31)),
      };
    }
    default:
      return { from: null, to: null };
  }
}

// ── Balance Sheet ─────────────────────────────────────────────────────────────

export const getBalanceSheet = ({ associationId, asOfDate, accountingBasis }) =>
  httpClient.get("/api/v1/reports/financial/balance-sheet", {
    params: {
      ...(associationId   ? { associationId }   : {}),
      ...(asOfDate        ? { asOfDate }         : {}),
      ...(accountingBasis ? { accountingBasis }  : {}),
    },
  });

// ── Income Statement ──────────────────────────────────────────────────────────

export const getIncomeStatement = ({ associationId, from, to, accountingBasis, accountSelection }) =>
  httpClient.get("/api/v1/reports/financial/income-statement", {
    params: {
      ...(associationId    ? { associationId }    : {}),
      ...(from             ? { from }             : {}),
      ...(to               ? { to }               : {}),
      ...(accountingBasis  ? { accountingBasis }  : {}),
      ...(accountSelection ? { accountSelection } : {}),
    },
  });

// ── Trial Balance ─────────────────────────────────────────────────────────────

export const getTrialBalance = ({ associationId, from, to, accountingBasis }) =>
  httpClient.get("/api/v1/reports/financial/trial-balance", {
    params: {
      ...(associationId   ? { associationId }   : {}),
      ...(from            ? { from }            : {}),
      ...(to              ? { to }              : {}),
      ...(accountingBasis ? { accountingBasis } : {}),
    },
  });

// ── Cash Flow ─────────────────────────────────────────────────────────────────

export const getCashFlow = ({ associationId, from, to, accountingBasis }) =>
  httpClient.get("/api/v1/reports/financial/cash-flow", {
    params: {
      ...(associationId   ? { associationId }   : {}),
      ...(from            ? { from }            : {}),
      ...(to              ? { to }              : {}),
      ...(accountingBasis ? { accountingBasis } : {}),
    },
  });

// ── Vendor Ledger ─────────────────────────────────────────────────────────────

export const getVendorLedger = ({ associationId, vendorId, from, to }) =>
  httpClient.get("/api/v1/reports/financial/vendor-ledger", {
    params: {
      ...(associationId ? { associationId } : {}),
      ...(vendorId      ? { vendorId }      : {}),
      ...(from          ? { from }          : {}),
      ...(to            ? { to }            : {}),
    },
  });

// ── Budget vs Actual ──────────────────────────────────────────────────────────

export const getBudgetVsActual = ({ budgetId, accountingBasis, from, to }) =>
  httpClient.get("/api/v1/reports/financial/budget-vs-actual", {
    params: {
      budgetId,
      ...(accountingBasis ? { accountingBasis } : {}),
      ...(from            ? { from }            : {}),
      ...(to              ? { to }              : {}),
    },
  });

// ── Budget list (for dropdown) ────────────────────────────────────────────────

export const getBudgets = (associationId) =>
  httpClient.get("/api/v1/accounting/budgets", {
    params: associationId ? { associationId } : {},
  });