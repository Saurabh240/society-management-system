package com.gstech.saas.communication.dto;

public record CreateTemplateRequest (

     Long tenantId,
     String name,
     Level level,
     String category,
     String description,
     String recipientType,
     String subject,
     String body,
     String content)
{}


