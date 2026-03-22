package com.gstech.saas.communication.dto;

public record UpdateTemplateRequest (

     String name,
     Level level,
     String category,
     String subject,
     String body)
{}


