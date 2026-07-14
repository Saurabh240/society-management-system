package com.gstech.saas.platform.subscription.model;

public final class PlanLimits {

    private PlanLimits() {}

    /** Number of units included free in both FREE and STANDARD plans. */
    public static final int FREE_UNIT_LIMIT = 15;

    /** Price in cents per unit above FREE_UNIT_LIMIT for STANDARD plan. */
    public static final int PAID_PRICE_PER_UNIT_CENTS = 100; // $1.00

    /**
     * Calculates monthly charge in cents.
     * 0–15 units  → $0
     * 16 units    → $1 (1 × $1)
     * 20 units    → $5 (5 × $1)
     */
    public static int calculateMonthlyChargeCents(int totalUnits) {
        if (totalUnits <= FREE_UNIT_LIMIT) return 0;
        return (totalUnits - FREE_UNIT_LIMIT) * PAID_PRICE_PER_UNIT_CENTS;
    }

    /** Calculates monthly charge in dollars (for display). */
    public static double calculateMonthlyChargeDollars(int totalUnits) {
        return calculateMonthlyChargeCents(totalUnits) / 100.0;
    }
}