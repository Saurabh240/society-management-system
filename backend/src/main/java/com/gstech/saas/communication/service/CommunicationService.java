package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateMessageRequest;

public interface CommunicationService {

    Long createEmail(CreateMessageRequest request);
}