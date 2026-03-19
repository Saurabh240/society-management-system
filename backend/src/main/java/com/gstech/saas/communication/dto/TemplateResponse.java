package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TemplateResponse {

    private Long id;
    private String name;
    private String level;
    private String category;
    private LocalDateTime lastModified;

}
