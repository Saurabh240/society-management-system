package com.gstech.saas.accounting.coa.dto;

import com.gstech.saas.accounting.coa.model.Coa;
import java.time.Instant;

public record CoaResponse(

        Long id,
        String accountCode,
        String accountName,
        AccountType accountType,
        String notes,
        Instant createdAt

) {

    public static CoaResponse from(Coa coa) {
        return new CoaResponse(
                coa.getId(),
                coa.getAccountCode(),
                coa.getAccountName(),
                coa.getAccountType(),
                coa.getNotes(),
                coa.getCreatedAt()
        );
    }
}