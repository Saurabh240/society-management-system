package com.gstech.saas.associations.vendor.model;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

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

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String contactName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column
    private String altEmail;

    @Column
    private String altPhone;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false, length = 10)
    private String zipCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorStatus status;

    @Column
    private String serviceCategory;

    @Column
    private Instant updatedAt;

    @PreUpdate
    protected void onPreUpdate() { this.updatedAt = Instant.now(); }
}