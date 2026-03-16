package com.gstech.saas.associations.unit.dtos;

import java.time.Instant;
import java.util.List;

import com.gstech.saas.associations.owner.model.Owner;
import com.gstech.saas.associations.unit.model.OccupancyStatus;

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
    private String associationName;
    private int balance;
    private Instant createdAt;
    private Instant updatedAt;
    private List<String> unitOwners;
    private String renterFirstName;
    private String renterLastName;
    private String renterEmail;
    private String renterPhone;

    public UnitResponse(Long id, String unitNumber, Long tenantId, Long associationId, String street, String city,
            String state, String zipCode, OccupancyStatus occupancyStatus, String associationName, int balance, Instant createdAt,
                        Instant updatedAt, List<Owner> unitOwners, String renterFirstName, String renterLastName, String renterEmail, String renterPhone) {
        this.id = id;
        this.unitNumber = unitNumber;
        this.tenantId = tenantId;
        this.associationId = associationId;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.occupancyStatus = occupancyStatus;
        this.associationName = associationName;
        this.balance = balance;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.unitOwners = unitOwners == null ? null
                : unitOwners.stream().map(owner -> owner.getFirstName() + " " + owner.getLastName()).toList();
        this.renterFirstName = renterFirstName;
        this.renterLastName = renterLastName;
        this.renterEmail = renterEmail;
        this.renterPhone = renterPhone;
    }
}
