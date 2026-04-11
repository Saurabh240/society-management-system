package com.gstech.saas.accounting.banking.model;

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

    @Column(nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private String bankAccountName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BankAccountType accountType;

    @Column(nullable = false)
    @Builder.Default
    private String country = "United States";

    // 9-digit routing number — validated before save
    @Column(nullable = false, length = 9)
    private String routingNumber;

    // Only last 4 digits stored (e.g. "****5678") — full number never persisted
    @Column(nullable = false, length = 10)
    private String accountNumberMasked;

    @Column(columnDefinition = "TEXT")
    private String accountNotes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean checkPrintingEnabled = false;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;
}
