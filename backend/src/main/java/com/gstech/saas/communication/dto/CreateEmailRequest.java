package com.gstech.saas.communication.dto;

import lombok.Data;

@Data
public class CreateEmailRequest {

    private Long associationId;

    private String subject;

    private String body;

    private RecipientRequest recipient;

}
