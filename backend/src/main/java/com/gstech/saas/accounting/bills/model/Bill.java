package com.gstech.saas.accounting.bills.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
@Getter
@Setter
public class Bill extends BaseEntity {

    @Column(name = "bill_number", nullable = false)
    private String billNumber;

    @Column(name = "vendor_id", nullable = false)
    private Long vendorId;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    private LocalDate issueDate;
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private BillStatus status;

    private BigDecimal totalAmount;

    private String memo;

    private Instant paidAt;

    private Long paidFromBankAccountId;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillLineItem> lineItems = new ArrayList<>();
}
