package com.gstech.saas.communication.dto;

import lombok.Data;

import java.util.List;

@Data
public class RecipientRequest {

    private List<Long> ownerIds;

    private List<Long> vendorIds;

    private Long associationId;

    private RecipientType type;
}
