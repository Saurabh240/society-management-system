package com.gstech.saas.communication.dto;

import java.time.Instant;

public record TemplateResponse (

     Long id,
     String name,
     Level level,
     String category,
     Instant lastModified){

}
