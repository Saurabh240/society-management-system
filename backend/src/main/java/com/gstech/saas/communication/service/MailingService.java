package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateMailingRequest;
import com.gstech.saas.communication.dto.MailingDetailDto;
import com.gstech.saas.communication.dto.MailingDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MailingService {

    Page<MailingDto> listMailings(Pageable pageable);

    MailingDetailDto getMailingById(Long id);

    Long createMailing(CreateMailingRequest request);

    void updateMailing(Long id, CreateMailingRequest request);

    void deleteMailing(Long id);
    void deleteMailingsByIds(List<Long> ids);
}