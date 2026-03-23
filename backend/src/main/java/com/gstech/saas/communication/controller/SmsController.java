package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateMessageRequest;
import com.gstech.saas.communication.dto.CreateSmsRequest;
import com.gstech.saas.communication.dto.RescheduleRequest;
import com.gstech.saas.communication.dto.SmsResponse;
import com.gstech.saas.communication.service.SmsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "SMS list retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public List<SmsResponse> listSms() {
        return smsService.listSms();
    }

    @Operation(summary = "Create and send an SMS")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "SMS created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public Long createSms(@RequestBody CreateMessageRequest request) {
        return smsService.createSms(request);
    }

    @Operation(summary = "Resend an SMS")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "SMS resent successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "SMS not found")
    })
    @PostMapping("/{id}/resend")
    public Map<String, String> resendSms(@PathVariable Long id) {
        smsService.resendSms(id);
        return Map.of("message", "SMS resent successfully");
    }

    @Operation(summary = "Reschedule an SMS")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "SMS rescheduled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "SMS not found")
    })
    @PostMapping("/{id}/reschedule")
    public SmsResponse rescheduleSms(@PathVariable Long id, @RequestBody RescheduleRequest request) {
        return smsService.rescheduleSms(id, request);
    }

    @Operation(summary = "Delete an SMS")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "SMS deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "SMS not found")
    })
    @DeleteMapping("/{id}")
    public void deleteSms(@PathVariable Long id) {
        smsService.deleteSms(id);
    }
}
