package com.gstech.saas.communication.dto;

public record DeliverySummary(
        int total,
        int delivered,
        int pending,
        int failed
) {
    public static final DeliverySummary EMPTY = new DeliverySummary(0, 0, 0, 0);
}
