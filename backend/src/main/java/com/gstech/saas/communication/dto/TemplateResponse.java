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
        String description,       // ← add
        String recipientType,     // ← add
        String subject,
        String body,
        String content,           // ← add
        LocalDateTime lastModified){

}
