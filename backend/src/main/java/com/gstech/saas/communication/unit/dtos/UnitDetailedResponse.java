package com.gstech.saas.communication.unit.dtos;

import java.time.Instant;
import java.util.List;

import com.gstech.saas.communication.owner.dtos.OwnerListResponseType;
import com.gstech.saas.communication.unit.model.OccupancyStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UnitDetailedResponse {
    private Long id;
    private String unitNumber;
    private Long tenantId;
    private Long associationId;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private OccupancyStatus occupancyStatus;
    private int balance;
    private String associationName;
    private Instant updatedAt;
    private List<OwnerListResponseType> unitOwners;
}
