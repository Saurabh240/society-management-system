package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmailService {

        Long sendEmail(CreateMessageRequest request);

        Page<MessageDto> listEmails(Pageable pageable);

        MessageDetailDto getEmail(Long id);

        void updateEmail(Long id, UpdateMessageRequest request);

        void resendEmail(Long id);

        void rescheduleEmail(Long id, RescheduleRequest request);

        void deleteEmail(Long id);
        void deleteEmailsByIds(List<Long> ids);
}
