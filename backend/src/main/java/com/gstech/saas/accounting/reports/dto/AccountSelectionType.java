package com.gstech.saas.accounting.reports.dto;

/**
 * Account selection filter for financial reports
 */
public enum AccountSelectionType {
    ALL,                // Include all accounts
    INCOME_ONLY,        // Income Statement: only INCOME accounts
    EXPENSE_ONLY        // Income Statement: only EXPENSE accounts
}

