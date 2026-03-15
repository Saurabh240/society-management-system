package com.gstech.saas.associations.owner.dtos;

public record OwnerUnitRowResponse(

        Long ownerId,
        String firstName,
        String lastName,
        Long associationId,
        String associationName,
        Long unitId,
        String unitNumber,
        String email,
        String phone

) {}