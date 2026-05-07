package com.gstech.saas.associations.help.service;

import com.gstech.saas.associations.help.dto.*;
import com.gstech.saas.associations.help.model.FeatureSuggestion;
import com.gstech.saas.associations.help.model.SupportTicket;
import com.gstech.saas.associations.help.repository.FeatureSuggestionRepository;
import com.gstech.saas.associations.help.repository.SupportTicketRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class HelpService {

    private final SupportTicketRepository supportTicketRepository;
    private final FeatureSuggestionRepository featureSuggestionRepository;

    @Transactional
    public SupportTicketResponse submitTicket(SupportTicketRequest request, Long userId) {
        Long tenantId = TenantContext.get();

        SupportTicket ticket = SupportTicket.builder()
                .userId(userId)
                .subject(request.subject())
                .description(request.description())
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);
        log.info("Support ticket created: id={}, tenantId={}, userId={}", saved.getId(), tenantId, userId);

        return toTicketResponse(saved);
    }

    @Transactional
    public FeatureSuggestionResponse submitSuggestion(FeatureSuggestionRequest request, Long userId) {
        Long tenantId = TenantContext.get();

        FeatureSuggestion suggestion = FeatureSuggestion.builder()
                .userId(userId)
                .title(request.title())
                .description(request.description())
                .build();

        FeatureSuggestion saved = featureSuggestionRepository.save(suggestion);
        log.info("Feature suggestion created: id={}, tenantId={}, userId={}", saved.getId(), tenantId, userId);

        return toSuggestionResponse(saved);
    }

    private SupportTicketResponse toTicketResponse(SupportTicket t) {
        return new SupportTicketResponse(
                t.getId(),
                t.getUserId(),
                t.getSubject(),
                t.getDescription(),
                t.getStatus(),
                t.getCreatedAt()
        );
    }

    private FeatureSuggestionResponse toSuggestionResponse(FeatureSuggestion f) {
        return new FeatureSuggestionResponse(
                f.getId(),
                f.getUserId(),
                f.getTitle(),
                f.getDescription(),
                f.getCreatedAt()
        );
    }
}