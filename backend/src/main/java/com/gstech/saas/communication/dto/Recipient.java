package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Recipient {

    private Long ownerId;

    private String email;

    private String phone;

}
