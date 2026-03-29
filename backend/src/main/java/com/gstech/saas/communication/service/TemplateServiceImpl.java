package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.engine.TemplateEngine;
import com.gstech.saas.communication.model.CommunicationTemplate;
import com.gstech.saas.communication.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateEngine templateEngine;

    @Override
    public List<TemplateResponse> getTemplates(Level level) {
        List<CommunicationTemplate> templates;
        if (level != null) {
            templates = templateRepository.findByLevel(level);
        } else {
            templates = templateRepository.findAll();
        }
        return templates.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TemplateResponse createTemplate(CreateTemplateRequest request) {
        CommunicationTemplate template = new CommunicationTemplate();
        template.setTenantId(request.tenantId());
        template.setName(request.name());
        template.setLevel(request.level());
        template.setCategory(request.category());
        template.setSubject(request.subject());
        template.setBody(request.body());
        template.setCreatedAt(LocalDateTime.now());

        CommunicationTemplate saved = templateRepository.save(template);
        return mapToResponse(saved);
    }

    @Override
    public TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request) {
        CommunicationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setName(request.name());
        template.setLevel(request.level());
        template.setCategory(request.category());
        template.setSubject(request.subject());
        template.setBody(request.body());

        CommunicationTemplate updated = templateRepository.save(template);
        return mapToResponse(updated);
    }
    @Override
    public TemplateResponse getTemplateById(Long id) {
        CommunicationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
        return mapToResponse(template);
    }

    @Override
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }

    @Override
    public void deleteTemplatesByIds(List<Long> ids) {
        templateRepository.deleteAllById(ids);
    }

    @Override
    public TemplateEngineResponse resolve(TemplateEngineRequest request) {
        CommunicationTemplate template = templateRepository.findById(request.templateId())
                .orElseThrow(() -> new RuntimeException("Template not found: " + request.templateId()));

        String processedSubject = templateEngine.process(template.getSubject(), request.variables());
        String processedBody = templateEngine.process(template.getBody(), request.variables());

        return new TemplateEngineResponse(processedSubject, processedBody);
    }

    private TemplateResponse mapToResponse(CommunicationTemplate template) {
        return new TemplateResponse(
                template.getId(),
                template.getName(),
                template.getLevel(),
                template.getCategory(),
                template.getCreatedAt()
        );
    }
}