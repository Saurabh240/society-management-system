package com.gstech.saas.accounting.coa.model;

import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "chart_of_accounts",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_coa_tenant_code",
                columnNames = {"tenant_id", "account_code"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coa extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_code", nullable = false, length = 20)
    private String accountCode;

    @Column(name = "account_name", nullable = false, length = 100)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private AccountType accountType;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}