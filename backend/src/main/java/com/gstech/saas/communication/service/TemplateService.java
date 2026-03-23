package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;

import java.util.List;

public interface TemplateService {

    List<TemplateResponse> getTemplates(Level level);
    TemplateResponse createTemplate(CreateTemplateRequest request);
    TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request);
    void deleteTemplate(Long id);
    void deleteTemplatesByIds(List<Long> ids);
    TemplateEngineResponse resolve(TemplateEngineRequest request);
}