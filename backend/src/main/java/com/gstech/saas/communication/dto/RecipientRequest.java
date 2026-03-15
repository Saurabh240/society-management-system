package com.gstech.saas.communication.dto;

import lombok.Data;

@Data
public class RecipientRequest {

    private RecipientType type;

    private Long ownerId;

    private Long associationId;

}
