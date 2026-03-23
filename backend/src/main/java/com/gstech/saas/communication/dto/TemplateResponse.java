package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

public record TemplateResponse (

     Long id,
     String name,
     Level level,
     String category,
     LocalDateTime lastModified){

}
