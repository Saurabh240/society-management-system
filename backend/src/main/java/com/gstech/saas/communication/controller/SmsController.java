package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateMessageRequest;
import com.gstech.saas.communication.dto.RescheduleRequest;
import com.gstech.saas.communication.dto.SmsResponse;
import com.gstech.saas.communication.service.SmsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/communications/sms")
@RequiredArgsConstructor
@Tag(name = "SMS", description = "SMS management APIs")
public class SmsController {

    private final SmsService smsService;

    @Operation(summary = "List all SMS messages")
    @GetMapping
    public List<SmsResponse> listSms() {
        return smsService.listSms();
    }

    @Operation(summary = "Create and send an SMS")
    @PostMapping
    public Long createSms(@RequestBody CreateMessageRequest request) {
        return smsService.createSms(request);
    }

    @Operation(summary = "Resend an SMS")
    @PostMapping("/{id}/resend")
    public Map<String, String> resendSms(@PathVariable Long id) {
        smsService.resendSms(id);
        return Map.of("message", "SMS resent successfully");
    }

    @Operation(summary = "Reschedule an SMS")
    @PostMapping("/{id}/reschedule")
    public SmsResponse rescheduleSms(@PathVariable Long id, @RequestBody RescheduleRequest request) {
        return smsService.rescheduleSms(id, request);
    }

    @Operation(summary = "Delete an SMS")
    @DeleteMapping("/{id}")
    public void deleteSms(@PathVariable Long id) {
        smsService.deleteSms(id);
    }
}
