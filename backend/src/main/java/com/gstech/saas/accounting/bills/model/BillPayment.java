package com.gstech.saas.accounting.bills.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "bill_payments",
        indexes = {
                @Index(name = "idx_bill_payments_bill",   columnList = "bill_id"),
                @Index(name = "idx_bill_payments_tenant", columnList = "tenant_id, bill_id")
        }
)
@Getter
@Setter
public class BillPayment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_id", nullable = false)
    private Long billId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "bank_account_id", nullable = false)
    private Long bankAccountId;
}