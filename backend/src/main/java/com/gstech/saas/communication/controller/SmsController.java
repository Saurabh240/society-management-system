package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateMessageRequest;
import com.gstech.saas.communication.dto.RescheduleRequest;
import com.gstech.saas.communication.dto.SmsResponse;
import com.gstech.saas.communication.service.SmsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/communications/sms")
@RequiredArgsConstructor
@Tag(name = "SMS", description = "SMS APIs")
public class SmsController {

    private final SmsService smsService;

    @GetMapping
    public Page<SmsResponse> listSms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return smsService.listSms(pageable);
    }
    @Operation(summary = "Get SMS by ID")
    @GetMapping("/{id}")
    public SmsResponse getSmsById(@PathVariable Long id) {
        return smsService.getSmsById(id);
    }

    @Operation(summary = "Update an SMS")
    @PutMapping("/{id}")
    public SmsResponse updateSms(@PathVariable Long id, @RequestBody CreateMessageRequest request) {
        return smsService.updateSms(id, request);
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
    @Operation(summary = "Delete multiple SMS messages")
    @PostMapping("/batch")
    public void deleteSmsByIds(@RequestBody List<Long> ids) {
        smsService.deleteSmsByIds(ids);
    }
}
