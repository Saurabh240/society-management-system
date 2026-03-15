package com.gstech.saas.associations.owner.dtos;

public record OwnerUnitRowResponse(

        Long ownerId,
        String firstName,
        String lastName,
        String associationName,
        String unitNumber,
        String email,
        String phone

) {}