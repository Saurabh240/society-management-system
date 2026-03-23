package com.gstech.saas.communication.dto;

public record CreateTemplateRequest (

     Long tenantId,
     String name,
     Level level,
     String category,
     String subject,
     String body)
{}


