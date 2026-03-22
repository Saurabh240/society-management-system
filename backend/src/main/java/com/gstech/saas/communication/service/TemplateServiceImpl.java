package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateTemplateRequest;
import com.gstech.saas.communication.dto.Level;
import com.gstech.saas.communication.dto.TemplateResponse;
import com.gstech.saas.communication.dto.UpdateTemplateRequest;
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
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }

    @Override
    public void deleteTemplatesByIds(List<Long> ids) {
        templateRepository.deleteAllById(ids);
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