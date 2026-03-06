package com.gstech.saas.communication.unit.dtos;

import java.time.Instant;
import java.util.List;

import com.gstech.saas.communication.owner.model.Owner;
import com.gstech.saas.communication.unit.model.OccupancyStatus;

import lombok.Data;

@Data
public class UnitResponse {
    private Long id;
    private String unitNumber;
    private Long tenantId;
    private Long associationId;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private OccupancyStatus occupancyStatus;
    private Instant createdAt;
    private Instant updatedAt;
    private List<String> unitOwners;

    public UnitResponse(Long id, String unitNumber, Long tenantId, Long associationId, String street, String city,
            String state, String zipCode, OccupancyStatus occupancyStatus, Instant createdAt, Instant updatedAt,
            List<Owner> unitOwners) {
        this.id = id;
        this.unitNumber = unitNumber;
        this.tenantId = tenantId;
        this.associationId = associationId;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.occupancyStatus = occupancyStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.unitOwners = unitOwners == null ? null
                : unitOwners.stream().map(owner -> owner.getFirstName() + " " + owner.getLastName()).toList();
    }
}
