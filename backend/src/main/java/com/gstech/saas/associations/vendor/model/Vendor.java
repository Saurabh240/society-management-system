package com.gstech.saas.associations.vendor.model;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.associations.vendor.enums.VendorStatus;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "vendors",
        indexes = {
                @Index(name = "idx_vendors_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_vendors_email",     columnList = "email")
        },
        uniqueConstraints = @UniqueConstraint(
                name  = "uq_vendors_tenant_email",
                columnNames = {"tenant_id", "email"}
        )
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Vendor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Vendor Type ──────────────────────────────────────
    @Column(nullable = false)
    private Boolean isCompany;          // true = company vendor, false = individual vendor

    // ── Basic Info ───────────────────────────────────────
    @Column
    private String firstName;           // Required if isCompany = false

    @Column
    private String lastName;            // Required if isCompany = false

    @Column
    private String companyName;         // Required if isCompany = true

    @Column(nullable = false)
    private String serviceCategory;

    // ── Contact Info ─────────────────────────────────────
    @Column(nullable = false)
    private String email;               // Primary Email

    @Column
    private String altEmail;            // Alternative Email

    @Column
    private String mobilePhone;         // ← was phone (renamed)

    @Column
    private String workPhone;           // ← was altPhone (renamed)

    @Column
    private String homePhone;           // ← new

    @Column
    private String website;             // ← new

    // ── Address ──────────────────────────────────────────
    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false, length = 10)
    private String zipCode;

    @Column
    private String country;             // ← new

    // ── Tax Info ─────────────────────────────────────────
    @Column
    private String taxIdentityType;     // ← new (EIN, SSN, etc.)

    @Column
    private String taxPayerId;          // ← new

    // ── Insurance ────────────────────────────────────────
    @Column
    private String insuranceProvider;   // ← new

    @Column
    private String policyNumber;        // ← new

    @Column
    private LocalDate insuranceExpiry;  // ← new

    // ── Accounting ──────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_expense_account_id", foreignKey = @ForeignKey(name = "fk_vendors_default_expense_account"))
    private Coa defaultExpenseAccount;  // Default account for bill line items from this vendor

    // ── Additional ───────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String notes;               // ← new

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorStatus status;

    @Column
    private Instant updatedAt;

    @PreUpdate
    protected void onPreUpdate() { this.updatedAt = Instant.now(); }
}