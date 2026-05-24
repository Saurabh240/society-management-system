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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateEngine     templateEngine;
    private final OwnerLookupService ownerLookupService;

    // ── List ──────────────────────────────────────────────────────────────────

    @Override
    public Page<TemplateResponse> getTemplates(Level level, Pageable pageable) {
        Long tenantId = TenantContext.get();
        Page<CommunicationTemplate> templates = level != null
                ? templateRepository.findByTenantIdAndLevel(tenantId, level, pageable)
                : templateRepository.findByTenantId(tenantId, pageable);
        return templates.map(this::mapToResponse);
    }

    @Override
    public List<TemplateResponse> getAllTemplates(Level level) {
        Long tenantId = TenantContext.get();
        List<CommunicationTemplate> templates = level != null
                ? templateRepository.findByTenantIdAndLevel(tenantId, level)
                : templateRepository.findByTenantId(tenantId);
        return templates.stream().map(this::mapToResponse).toList();
    }

    // ── Create / Update / Get / Delete ────────────────────────────────────────

    @Override
    public TemplateResponse createTemplate(CreateTemplateRequest request) {
        CommunicationTemplate template = new CommunicationTemplate();
        template.setName(request.name());
        template.setLevel(request.level());
        template.setCategory(request.category());
        template.setDescription(request.description());
        template.setRecipientType(request.recipientType());
        template.setSubject(request.subject());
        template.setContent(request.content());
        template.setCreatedAt(Instant.now());
        return mapToResponse(templateRepository.save(template));
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
        template.setContent(request.content());
        return mapToResponse(templateRepository.save(template));
    }

    @Override
    public TemplateResponse getTemplateById(Long id) {
        Long tenantId = TenantContext.get();
        return mapToResponse(templateRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id)));
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteByIdAndTenantId(id, TenantContext.get());
    }

    @Override
    @Transactional
    public void deleteTemplatesByIds(List<Long> ids) {
        templateRepository.deleteByIdsAndTenantId(ids, TenantContext.get());
    }

    // ── Resolve ───────────────────────────────────────────────────────────────

    /**
     * Resolves template variables.
     *
     * Phase 1 — static variables from request.variables() map are always applied.
     * Common compose-time keys: associationName, date, subject.
     *
     * Phase 2 — per-recipient variables (ownerName, unitNumber, email) are resolved
     * only when request.previewOwnerId() is provided. This allows the UI to show a
     * realistic preview for a specific owner before sending.
     *
     * When previewOwnerId is null, {{ownerName}} etc. remain as literal placeholders
     * in the output — this is expected. They will be resolved per-recipient at send time
     * by OwnerVariableResolver in the Kafka consumer pipeline.
     */
    @Override
    public TemplateEngineResponse resolve(TemplateEngineRequest request) {
        Long tenantId = TenantContext.get();
        CommunicationTemplate template = templateRepository.findByIdAndTenantId(request.templateId(), tenantId)
                .orElseThrow(() -> new RuntimeException("Template not found: " + request.templateId()));

        // Start with the caller-supplied variables (e.g. associationName, date)
        Map<String, String> vars = new HashMap<>();
        if (request.variables() != null) {
            vars.putAll(request.variables());
        }

        // If a preview owner is specified, resolve per-recipient variables too
        if (request.previewOwnerId() != null && request.variables() != null) {
            Long associationId = extractAssociationId(request.variables());
            if (associationId != null) {
                ownerLookupService
                        .findOwnersByAssociation(associationId)
                        .stream()
                        .filter(o -> o.getOwnerId().equals(request.previewOwnerId()))
                        .findFirst()
                        .ifPresent(owner -> {
                            vars.put("ownerName",  owner.getName());
                            vars.put("unitNumber", owner.getUnitNumber());
                            vars.put("email",      owner.getEmail() != null ? owner.getEmail() : "");
                        });
            }
        }

        String processedSubject = templateEngine.process(template.getSubject(), vars);
        String processedBody    = templateEngine.process(template.getContent(),  vars);

        return new TemplateEngineResponse(processedSubject, processedBody);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Extracts associationId from the variables map.
     * The frontend sends it as a string key "associationId" alongside other variables.
     */
    private Long extractAssociationId(Map<String, String> variables) {
        String val = variables.get("associationId");
        if (val == null || val.isBlank()) return null;
        try {
            return Long.parseLong(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
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
                template.getContent(),
                template.getCreatedAt()
        );
    }
}