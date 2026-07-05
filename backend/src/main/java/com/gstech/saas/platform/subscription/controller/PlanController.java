package com.gstech.saas.platform.subscription.controller;

import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.subscription.dto.PlanSelectionRequest;
import com.gstech.saas.platform.subscription.dto.PlanStatusResponse;
import com.gstech.saas.platform.subscription.dto.SubscriptionResponse;
import com.gstech.saas.platform.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/plan")
@RequiredArgsConstructor
@Tag(name = "Plan", description = "Subscription plan selection and status")
public class PlanController {

    private final SubscriptionService subscriptionService;

    @Operation(summary = "Select a subscription plan",
            description = "Called once after first login. Sets plan to FREE or STANDARD.")
    @PostMapping("/select")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> selectPlan(
            @Valid @RequestBody PlanSelectionRequest request) {
        SubscriptionResponse response = subscriptionService.selectPlan(request.plan());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get plan status",
            description = "Returns current plan, units used/remaining, monthly charge, and whether plan has been selected.")
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<PlanStatusResponse>> getPlanStatus() {
        return ResponseEntity.ok(ApiResponse.success(subscriptionService.getPlanStatus()));
    }

    @Operation(summary = "Get current subscription")
    @GetMapping
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getSubscription() {
        return ResponseEntity.ok(ApiResponse.success(subscriptionService.getSubscription()));
    }
}