package com.gstech.saas.associations.association.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.platform.common.BaseEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "associations",
        indexes = {
                @Index(name = "idx_associations_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_associations_tenant_name", columnList = "tenant_id, name")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uq_associations_tenant_name",
                columnNames = {"tenant_id", "name"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Association extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String streetAddress;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false, length = 10)
    private String zipCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TaxIdentityType taxIdentityType;

    @Column(nullable = false)
    private String taxPayerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private AssociationStatus status = AssociationStatus.ACTIVE;

    // Denormalized counter — kept in sync via repository methods
    // avoids COUNT(*) on units table for every list query
    @Column(nullable = false)
    @Builder.Default
    private Integer totalUnits = 0;

    @Column
    private Instant updatedAt;

    @OneToMany(mappedBy = "association", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Unit> units = new ArrayList<>();

    @OneToMany(mappedBy = "association", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AssociationFile> files = new ArrayList<>();

    @PreUpdate
    protected void onPreUpdate() {
        this.updatedAt = Instant.now();
    }
}
