package com.gstech.saas.accounting.banking.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BalanceUpdateRequest(
        @NotNull BigDecimal balance
) {}
