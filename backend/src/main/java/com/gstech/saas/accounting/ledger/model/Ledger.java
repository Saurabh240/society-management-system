package com.gstech.saas.accounting.ledger.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
    name = "ledger_entries",
    indexes = {
        @Index(name = "idx_ledger_entries_tenant_date", columnList = "tenant_id, date"),
        @Index(name = "idx_ledger_entries_account",     columnList = "tenant_id, account_id"),
        @Index(name = "idx_ledger_entries_assoc",       columnList = "tenant_id, association_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Ledger extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference back to the source journal entry
    @Column(nullable = false)
    private Long journalId;

    @Column(nullable = false)
    private Long accountId;

    @Column(nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal credit = BigDecimal.ZERO;

    // CASH or ACCRUAL
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String accountingBasis = "CASH";
}
