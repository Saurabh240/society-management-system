package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TemplateService {

    Page<TemplateResponse> getTemplates(Level level, Pageable pageable);
    TemplateResponse createTemplate(CreateTemplateRequest request);
    TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request);
    TemplateResponse getTemplateById(Long id);
    void deleteTemplate(Long id);
    void deleteTemplatesByIds(List<Long> ids);
    TemplateEngineResponse resolve(TemplateEngineRequest request);
}