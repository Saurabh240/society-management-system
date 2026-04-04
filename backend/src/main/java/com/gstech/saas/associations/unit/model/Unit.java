package com.gstech.saas.associations.unit.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.gstech.saas.associations.association.model.Association;
import com.gstech.saas.associations.owner.model.UnitOwner;
import com.gstech.saas.platform.common.BaseEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "units",
        indexes = {
                @Index(name = "idx_units_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_units_association_id", columnList = "association_id"),
                @Index(name = "idx_units_association_unit_number", columnList = "association_id, unit_number")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uq_units_association_unit_number",
                columnNames = {"association_id", "unit_number"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Unit extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "association_id", nullable = false)
    private Association association;

    @Column(nullable = false)
    private String unitNumber;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false, length = 10)
    private String zipCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OccupancyStatus occupancyStatus = OccupancyStatus.OWNER_OCCUPIED;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    // Renter fields — only populated when occupancyStatus == RENTED
    @Column
    private String renterFirstName;

    @Column
    private String renterLastName;

    @Column
    private String renterEmail;

    @Column
    private String renterPhone;

    @Column
    private Instant updatedAt;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UnitOwner> unitOwners = new ArrayList<>();

    @PreUpdate
    protected void onPreUpdate() {
        this.updatedAt = Instant.now();
    }

    // Domain method — keeps renter clearing logic out of the service
    public void clearRenterInfo() {
        this.renterFirstName = null;
        this.renterLastName = null;
        this.renterEmail = null;
        this.renterPhone = null;
    }
}
