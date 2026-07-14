package com.gstech.saas.accounting.budget.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "budget_line_items",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_budget_line_account",
                columnNames = {"budget_id", "account_id"}
        ),
        indexes = {
                @Index(name = "idx_budget_items_budget",  columnList = "budget_id"),
                @Index(name = "idx_budget_items_account", columnList = "account_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "budgeted_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal budgetedAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;
}