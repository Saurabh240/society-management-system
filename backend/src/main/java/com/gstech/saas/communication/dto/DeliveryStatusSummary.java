package com.gstech.saas.communication.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Aggregate delivery status summary for a message.
 * Includes delivery counts by status and a list of failed delivery details.
 */
@Data
@Builder
public class DeliveryStatusSummary {

    @JsonProperty("total_recipients")
    private Integer totalRecipients;

    @JsonProperty("delivered_count")
    private Integer deliveredCount;

    @JsonProperty("failed_count")
    private Integer failedCount;

    @JsonProperty("retrying_count")
    private Integer retryingCount;

    @JsonProperty("pending_count")
    private Integer pendingCount;

    @JsonProperty("dlq_count")
    private Integer dlqCount;

    @JsonProperty("summary_text")
    private String summaryText;

    @JsonProperty("failed_deliveries")
    private List<FailedDeliveryDetail> failedDeliveries;
}
