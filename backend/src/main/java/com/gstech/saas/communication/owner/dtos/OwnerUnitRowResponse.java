package com.gstech.saas.communication.owner.dtos;

public record OwnerUnitRowResponse(

        Long ownerId,
        String firstName,
        String lastName,
        String associationName,
        String unitNumber,
        String email,
        String phone

) {}