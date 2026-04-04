package com.gstech.saas.communication.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class RescheduleRequest {

    @NotNull(message = "New scheduled date-time is required")
    @Future(message = "Scheduled time must be in the future")
    private Instant scheduledAt;
}