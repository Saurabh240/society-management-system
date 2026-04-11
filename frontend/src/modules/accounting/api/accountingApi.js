import httpClient from "../../../api/httpClient";

// ── Overview ──────────────────────────────────────────────────────────────────
export const getOverview = () =>
  httpClient.get("/api/v1/accounting/overview");

// ── Chart of Accounts ─────────────────────────────────────────────────────────
export const getCoaList = (search = "", type = "") =>
  httpClient.get("/api/v1/accounting/coa", {
    params: {
      ...(search && { search }),
      ...(type   && { type   }),
    },
  });

export const getAccountById = (id) =>
  httpClient.get(`/api/v1/accounting/coa/${id}`);

export const createAccount = (data) =>
  httpClient.post("/api/v1/accounting/coa", data);

export const updateAccount = (id, data) =>
  httpClient.put(`/api/v1/accounting/coa/${id}`, data);

export const deleteAccount = (id) =>
  httpClient.delete(`/api/v1/accounting/coa/${id}`);

// ── General Ledger ────────────────────────────────────────────────────────────
export const getLedgerEntries = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  return httpClient.get("/api/v1/accounting/ledger", { params: clean });
};

// ── Journal Entries ───────────────────────────────────────────────────────────
export const createJournalEntry = (data) =>
  httpClient.post("/api/v1/accounting/journal-entries", data);

export const getJournalEntries = () =>
  httpClient.get("/api/v1/accounting/journal-entries");

// ── Banking ───────────────────────────────────────────────────────────────────
export const getBankAccounts = (associationId) =>
  httpClient.get("/api/v1/accounting/banking", {
    params: associationId ? { associationId } : {},
  });

export const createBankAccount = (data) =>
  httpClient.post("/api/v1/accounting/banking", data);

export const updateBankAccount = (id, data) =>
  httpClient.put(`/api/v1/accounting/banking/${id}`, data);

export const deleteBankAccount = (id) =>
  httpClient.delete(`/api/v1/accounting/banking/${id}`);

export const updateBankBalance = (id, balance) =>
  httpClient.patch(`/api/v1/accounting/banking/${id}/balance`, { balance });

// ── Bills ─────────────────────────────────────────────────────────────────────
export const getBillsSummary = () =>
  httpClient.get("/api/v1/accounting/bills/summary");

export const getBills = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  return httpClient.get("/api/v1/accounting/bills", { params: clean });
};

export const getBillById = (id) =>
  httpClient.get(`/api/v1/accounting/bills/${id}`);

export const createBill = (data) =>
  httpClient.post("/api/v1/accounting/bills", data);

export const updateBill = (id, data) =>
  httpClient.put(`/api/v1/accounting/bills/${id}`, data);

export const deleteBill = (id) =>
  httpClient.delete(`/api/v1/accounting/bills/${id}`);

export const payBill = (id, data) =>
  httpClient.post(`/api/v1/accounting/bills/${id}/pay`, data);

// ── Reports ───────────────────────────────────────────────────────────────────
export const getBalanceSheet = (associationId, asOfDate) =>
  httpClient.get("/api/v1/accounting/reports/balance-sheet", {
    params: {
      ...(associationId && { associationId }),
      ...(asOfDate      && { asOfDate      }),
    },
  });

export const getIncomeStatement = (associationId, from, to) =>
  httpClient.get("/api/v1/accounting/reports/income-statement", {
    params: {
      ...(associationId && { associationId }),
      ...(from          && { from          }),
      ...(to            && { to            }),
    },
  });