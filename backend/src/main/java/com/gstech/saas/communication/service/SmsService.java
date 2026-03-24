package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateMessageRequest;
import com.gstech.saas.communication.dto.RescheduleRequest;
import com.gstech.saas.communication.dto.SmsResponse;

import java.util.List;

public interface SmsService {

    List<SmsResponse> listSms();
    Long createSms(CreateMessageRequest request);
    void resendSms(Long id);
    SmsResponse rescheduleSms(Long id, RescheduleRequest request);
    void deleteSms(Long id);
}
