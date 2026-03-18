package com.gstech.saas.communication.dto;

import lombok.Data;

@Data
public class CreateMessageRequest {

    private Long associationId;

    private String subject;

    private String body;

    private Channel channel;

    private RecipientRequest recipient;

}
