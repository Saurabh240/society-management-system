package com.gstech.saas.accounting.invoice.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "invoice_payments",
        indexes = {
                @Index(name = "idx_invoice_payments_invoice", columnList = "invoice_id"),
                @Index(name = "idx_invoice_payments_tenant",  columnList = "tenant_id, invoice_id")
        }
)
@Getter
@Setter
public class InvoicePayment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "bank_account_id", nullable = false)
    private Long bankAccountId;

    private String memo;

    @Column(name = "idempotency_key")
    private String idempotencyKey;
}