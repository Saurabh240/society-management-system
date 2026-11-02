package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(of = "email")
public class Recipient {

    private Long ownerId;

    /** Set for vendor recipients so {{ownerName}} etc. can be resolved from the vendor. */
    private Long vendorId;

    private String email;

    private String phone;

}
