package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(of = "email")
public class Recipient {

    private Long ownerId;

    private String email;

    private String phone;

}
