package com.gstech.saas.communication.association.model;

import java.time.Instant;

import com.gstech.saas.platform.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "associations")
// implements builder for super class variables too
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Association extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String name;
    @Enumerated(EnumType.STRING)
    private AssociationStatus status;
    @Column(name = "street_address")
    private String streetAddress;
    private String city;
    private String state;
    @Column(name = "zip_code")
    private String zipCode;
    @Column(name = "tax_identity_type")
    @Enumerated(EnumType.STRING)
    private TaxIdentityType taxIdentityType;
    @Column(name = "tax_payer_id")
    private String taxPayerId;
    @Column(name = "total_units")
    @Builder.Default
    private Integer totalUnits = 0;
    @Column(name = "updated_at")
    private Instant updatedAt;
}
