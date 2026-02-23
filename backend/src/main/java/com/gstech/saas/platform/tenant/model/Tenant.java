package com.gstech.saas.platform.tenant.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, unique = true)
    private String subdomain;
    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false, length = 20)
    private TenantStatus status = TenantStatus.ACTIVE;
}
