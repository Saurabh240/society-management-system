package com.gstech.saas.communication.dto;

import lombok.Data;

@Data
public class UpdateTemplateRequest {

    private String name;
    private Level level;
    private String category;
    private String subject;
    private String body;

}
