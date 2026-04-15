package com.gstech.saas.accounting.banking.model;

import com.gstech.saas.accounting.banking.dto.BankAccountType;
import com.gstech.saas.associations.association.model.Association;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(
        name = "bank_accounts",
        indexes = {
                @Index(name = "idx_bank_accounts_tenant", columnList = "tenant_id"),
                @Index(name = "idx_bank_accounts_assoc",  columnList = "tenant_id, association_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Banking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @ManyToOne
    @JoinColumn(name = "association_id", insertable = false, updatable = false)
    private Association association;

    @Column(name = "bank_account_name", nullable = false, length = 255)
    private String bankAccountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private BankAccountType accountType;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "routing_number", nullable = false, length = 9)
    private String routingNumber;

    /**
     * Stored as "****XXXX" — the full account number is never persisted.
     * Masking happens in BankingService before save.
     */
    @Column(name = "account_number_masked", nullable = false, length = 10)
    private String accountNumberMasked;

    @Column(name = "account_notes", columnDefinition = "TEXT")
    private String accountNotes;

    @Builder.Default
    @Column(name = "check_printing_enabled", nullable = false)
    private Boolean checkPrintingEnabled = false;

    @Builder.Default
    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;
}