package com.gstech.saas.accounting.budget.model;

import com.gstech.saas.accounting.budget.dto.BudgetStatus;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "budgets",
        indexes = {
                @Index(name = "idx_budgets_tenant",       columnList = "tenant_id"),
                @Index(name = "idx_budgets_tenant_assoc", columnList = "tenant_id, association_id"),
                @Index(name = "idx_budgets_tenant_year",  columnList = "tenant_id, fiscal_year")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Budget extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id")
    private Long associationId;         // null = applies to all associations

    @Column(nullable = false)
    private String name;

    @Column(name = "fiscal_year", nullable = false)
    private Integer fiscalYear;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BudgetStatus status = BudgetStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(
            mappedBy = "budget",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<BudgetLineItem> lineItems = new ArrayList<>();
}