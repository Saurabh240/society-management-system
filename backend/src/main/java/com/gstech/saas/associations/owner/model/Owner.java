package com.gstech.saas.associations.owner.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.gstech.saas.platform.common.BaseEntity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "owners",
        indexes = {
                @Index(name = "idx_owners_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_owners_email", columnList = "email")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uq_owners_tenant_email",
                columnNames = {"tenant_id", "email"}  // scoped per-tenant, not globally unique
        )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Owner extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column
    private String altEmail;

    @Column(nullable = false)
    private String phone;

    @Column
    private String altPhone;

    @Column(nullable = false)
    private String primaryStreet;

    @Column(nullable = false)
    private String primaryCity;

    @Column(nullable = false)
    private String primaryState;

    @Column(nullable = false)
    private String primaryZip;

    @Column
    private String altStreet;

    @Column
    private String altCity;

    @Column
    private String altState;

    @Column
    private String altZip;

    @Column
    private Instant updatedAt;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UnitOwner> unitOwners = new ArrayList<>();

    @PreUpdate
    protected void onPreUpdate() {
        this.updatedAt = Instant.now();
    }
}