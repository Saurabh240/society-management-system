package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateEmailRequest;
import com.gstech.saas.communication.dto.CreateTemplateRequest;
import com.gstech.saas.communication.dto.TemplateResponse;
import com.gstech.saas.communication.dto.UpdateTemplateRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface CommunicationService {

    Long createEmail(CreateEmailRequest request);

    void sendNow(Long messageId);
    List<TemplateResponse> getTemplates(String level);
    TemplateResponse createTemplate(CreateTemplateRequest request);
    TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request);
    void deleteTemplate(Long id);
}