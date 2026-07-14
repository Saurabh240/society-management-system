package com.gstech.saas.accounting.reports.dto;

import java.time.LocalDate;
import java.util.List;

public record VendorLedgerResponse(
        LocalDate  from,
        LocalDate  to,
        List<VendorLedgerGroup> vendors
) {}