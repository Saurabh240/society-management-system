package com.gstech.saas.accounting.ledger.model;

import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
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
                @Index(name = "idx_ledger_tenant_association", columnList = "tenant_id, association_id"),
                @Index(name = "idx_ledger_tenant_account",     columnList = "tenant_id, account_id"),
                @Index(name = "idx_ledger_tenant_date",        columnList = "tenant_id, date")
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

    @Column(name = "journal_id")
    private Long journalId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    /** Accounting date of the entry (not the record creation timestamp) */
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "debit", nullable = false, precision = 19, scale = 4)
    private BigDecimal debit;

    @Column(name = "credit", nullable = false, precision = 19, scale = 4)
    private BigDecimal credit;

    @Enumerated(EnumType.STRING)
    @Column(name = "accounting_basis", nullable = false, length = 10)
    private AccountingBasis accountingBasis;
}
