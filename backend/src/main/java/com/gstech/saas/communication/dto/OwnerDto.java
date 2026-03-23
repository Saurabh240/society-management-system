package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OwnerDto {

    private Long ownerId;

    /** "Emily Martinez" */
    private String name;

    /** "Unit 201" */
    private String unitNumber;

    private String email;
}