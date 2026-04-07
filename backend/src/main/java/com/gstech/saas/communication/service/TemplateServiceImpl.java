package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.engine.TemplateEngine;
import com.gstech.saas.communication.model.CommunicationTemplate;
import com.gstech.saas.communication.repository.TemplateRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateEngine templateEngine;

    @Override
    public Page<TemplateResponse> getTemplates(Level level, Pageable pageable) {
        Page<CommunicationTemplate> templates;
        Long tenantId = TenantContext.get();
        templates = level != null
                ? templateRepository.findByTenantIdAndLevel(tenantId, level, pageable)
                : templateRepository.findByTenantId(tenantId, pageable);
        return templates.map(this::mapToResponse);
    }
    @Override
    public List<TemplateResponse> getAllTemplates(Level level) {
        List<CommunicationTemplate> templates;
        Long tenantId = TenantContext.get();
        templates = level != null
                ? templateRepository.findByTenantIdAndLevel(tenantId, level)
                : templateRepository.findByTenantId(tenantId);
        return templates.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TemplateResponse createTemplate(CreateTemplateRequest request) {
        CommunicationTemplate template = new CommunicationTemplate();
        template.setName(request.name());
        template.setLevel(request.level());
        template.setCategory(request.category());
        template.setDescription(request.description());
        template.setRecipientType(request.recipientType());
        template.setSubject(request.subject());
        template.setBody(request.body());
        template.setContent(request.content());
        template.setCreatedAt(Instant.now());

        CommunicationTemplate saved = templateRepository.save(template);
        return mapToResponse(saved);
    }

    @Override
    public TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request) {
        Long tenantId = TenantContext.get();
        CommunicationTemplate template = templateRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setName(request.name());
        template.setLevel(request.level());
        template.setCategory(request.category());
        template.setDescription(request.description());
        template.setRecipientType(request.recipientType());
        template.setSubject(request.subject());
        template.setBody(request.body());
        template.setContent(request.content());

        CommunicationTemplate updated = templateRepository.save(template);
        return mapToResponse(updated);
    }
    @Override
    public TemplateResponse getTemplateById(Long id) {
        Long tenantId = TenantContext.get();
        CommunicationTemplate template = templateRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
        return mapToResponse(template);
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {

        Long tenantId = TenantContext.get();
        templateRepository.deleteByIdAndTenantId(id, tenantId);
    }

    @Override
    @Transactional
    public void deleteTemplatesByIds(List<Long> ids) {

        templateRepository.deleteByIdsAndTenantId(ids, TenantContext.get());
    }

    @Override
    public TemplateEngineResponse resolve(TemplateEngineRequest request) {
        CommunicationTemplate template = templateRepository.findByIdAndTenantId(request.templateId(), TenantContext.get())
                .orElseThrow(() -> new RuntimeException("Template not found: " + request.templateId()));

        String processedSubject = templateEngine.process(template.getSubject(), request.variables());
        String processedBody = templateEngine.process(template.getBody(), request.variables());

        return new TemplateEngineResponse(processedSubject, processedBody);
    }

    private TemplateResponse mapToResponse(CommunicationTemplate template) {
        return new TemplateResponse(
                template.getId(),
                template.getTenantId(),
                template.getName(),
                template.getLevel(),
                template.getCategory(),
                template.getDescription(),
                template.getRecipientType(),
                template.getSubject(),
                template.getBody(),
                template.getContent(),
                template.getCreatedAt()
        );
    }
}