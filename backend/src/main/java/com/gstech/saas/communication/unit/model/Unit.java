package com.gstech.saas.communication.unit.model;

import java.time.Instant;

import com.gstech.saas.platform.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "units")
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Unit extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "unit_number")
    private String unitNumber;

    @Column(name = "occupancy_status")
    private String occupancyStatus;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
