package com.gstech.saas.communication.dto;

public record UpdateTemplateRequest (

     String name,
     Level level,
     String category,
     String description,
     String recipientType,
     String subject,
     String body,
     String content)
{}


