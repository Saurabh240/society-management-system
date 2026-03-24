package com.gstech.saas.communication.dto;

import java.time.Instant;
import java.util.List;

public record SmsResponse(
        Long id,
        String message,
        String recipient,
        List<String> phoneNumbers,
        Instant date,
        MessageStatus status
) {}
