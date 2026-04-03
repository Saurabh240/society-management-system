package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

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
        LocalDateTime lastModified){

}
