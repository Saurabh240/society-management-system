package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateMessageRequest;
import com.gstech.saas.communication.dto.RescheduleRequest;
import com.gstech.saas.communication.dto.SmsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SmsService {

    Page<SmsResponse> listSms(Pageable pageable);
    Long createSms(CreateMessageRequest request);
    void resendSms(Long id);
    SmsResponse rescheduleSms(Long id, RescheduleRequest request);
    void deleteSms(Long id);
    void deleteSmsByIds(List<Long> ids);
    SmsResponse getSmsById(Long id);
    SmsResponse updateSms(Long id, CreateMessageRequest request);
}
