package com.gstech.saas.associations.help.controller;

import com.gstech.saas.associations.help.dto.*;
import com.gstech.saas.associations.help.service.HelpService;
import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.common.HeaderConstant;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/help")
@RequiredArgsConstructor
@Tag(name = "Help", description = "Support tickets and feature suggestions")
public class HelpController {

    private final HelpService helpService;

    @Operation(summary = "Submit a support ticket")
    @PostMapping("/support")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> submitTicket(
            @RequestBody @Valid SupportTicketRequest request,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(helpService.submitTicket(request, userId)));
    }

    @Operation(summary = "Submit a feature suggestion")
    @PostMapping("/suggestion")
    public ResponseEntity<ApiResponse<FeatureSuggestionResponse>> submitSuggestion(
            @RequestBody @Valid FeatureSuggestionRequest request,
            @RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(helpService.submitSuggestion(request, userId)));
    }
}