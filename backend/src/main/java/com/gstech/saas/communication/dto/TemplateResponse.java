package com.gstech.saas.communication.dto;

import java.time.Instant;

public record TemplateResponse (

        Long id,
        Long tenantId,
        String name,
        Level level,
        String category,
        String description,
        String recipientType,
        String subject,
        String body,
        String content,
        Instant lastModified){

}
