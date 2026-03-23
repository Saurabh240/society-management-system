package com.gstech.saas.communication.dto;

import java.util.Map;

public record TemplateEngineRequest(
        Long templateId,
        Map<String, String> variables
) {}
