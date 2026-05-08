package com.gstech.saas.associations.help.dto;

import com.gstech.saas.associations.help.model.SupportTicketStatus;
import java.time.Instant;

public record SupportTicketResponse(
        Long id,
        Long userId,
        String subject,
        String description,
        SupportTicketStatus status,
        Instant createdAt
) {}