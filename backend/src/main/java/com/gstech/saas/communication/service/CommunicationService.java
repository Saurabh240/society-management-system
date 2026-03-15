package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateEmailRequest;

import java.time.LocalDateTime;

public interface CommunicationService {

    Long createEmail(CreateEmailRequest request);

    void sendNow(Long messageId);
}