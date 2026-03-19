package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;

import java.time.LocalDateTime;
import java.util.List;

public interface CommunicationService {

    Long createEmail(CreateEmailRequest request);

    void sendNow(Long messageId);
    List<TemplateResponse> getTemplates(Level level);
    TemplateResponse createTemplate(CreateTemplateRequest request);
    TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request);
    void deleteTemplate(Long id);
    void deleteTemplatesByIds(List<Long> ids);
}