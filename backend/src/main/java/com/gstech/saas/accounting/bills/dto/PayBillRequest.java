package com.gstech.saas.accounting.bills.dto;

import java.time.LocalDate;

public record PayBillRequest(
        Long bankAccountId,
        LocalDate paymentDate
) {}