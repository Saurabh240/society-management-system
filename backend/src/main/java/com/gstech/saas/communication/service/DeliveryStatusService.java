package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.DeliveryStatus;
import com.gstech.saas.communication.dto.DeliveryStatusSummary;
import com.gstech.saas.communication.dto.FailedDeliveryDetail;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service to build delivery status summaries for messages.
 * Aggregates delivery counts and collects error details.
 */
@Service
@RequiredArgsConstructor
public class DeliveryStatusService {

    private final DeliveryRepository deliveryRepository;

    /**
     * Build a complete delivery status summary for a message.
     * Counts deliveries by status and collects failed delivery details.
     */
    public DeliveryStatusSummary buildDeliveryStatusSummary(Long messageId) {
        List<Delivery> deliveries = deliveryRepository.findByMessageId(messageId);
        
        if (deliveries.isEmpty()) {
            return null; // No deliveries to report (e.g., DRAFT message)
        }

        // Count deliveries by status
        Long deliveredCount = deliveryRepository.countByMessageIdAndStatus(messageId, DeliveryStatus.DELIVERED);
        Long failedCount = deliveryRepository.countByMessageIdAndStatus(messageId, DeliveryStatus.FAILED);
        Long retryingCount = deliveryRepository.countByMessageIdAndStatus(messageId, DeliveryStatus.RETRYING);
        Long pendingCount = deliveryRepository.countByMessageIdAndStatus(messageId, DeliveryStatus.PENDING);
        Long dlqCount = deliveryRepository.countByMessageIdAndStatus(messageId, DeliveryStatus.DLQ);

        int total = deliveries.size();
        int delivered = deliveredCount.intValue();
        int failed = failedCount.intValue();
        int retrying = retryingCount.intValue();
        int pending = pendingCount.intValue();
        int dlq = dlqCount.intValue();

        // Build summary text
        String summaryText = buildSummaryText(total, delivered, failed, retrying, pending, dlq);

        // Collect failed delivery details
        List<FailedDeliveryDetail> failedDeliveries = deliveryRepository.findFailedDeliveriesByMessageId(messageId)
                .stream()
                .map(this::toFailedDeliveryDetail)
                .collect(Collectors.toList());

        return DeliveryStatusSummary.builder()
                .totalRecipients(total)
                .deliveredCount(delivered)
                .failedCount(failed)
                .retryingCount(retrying)
                .pendingCount(pending)
                .dlqCount(dlq)
                .summaryText(summaryText)
                .failedDeliveries(failedDeliveries)
                .build();
    }

    /**
     * Build a human-readable summary text.
     * E.g., "5 delivered, 2 failed, 1 retrying" or "10 delivered"
     */
    private String buildSummaryText(int total, int delivered, int failed, int retrying, int pending, int dlq) {
        StringBuilder sb = new StringBuilder();

        if (total == 0) {
            return "No deliveries";
        }

        if (delivered > 0) {
            sb.append(delivered).append(" delivered");
        }

        if (failed > 0) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(failed).append(" failed");
        }

        if (dlq > 0) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(dlq).append(" dlq");
        }

        if (retrying > 0) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(retrying).append(" retrying");
        }

        if (pending > 0) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(pending).append(" pending");
        }

        return sb.toString();
    }

    /**
     * Map a Delivery entity to a FailedDeliveryDetail for API response.
     */
    private FailedDeliveryDetail toFailedDeliveryDetail(Delivery delivery) {
        return FailedDeliveryDetail.builder()
                .recipientIdentifier(
                    delivery.getEmail() != null ? delivery.getEmail() :
                    (delivery.getPhone() != null ? delivery.getPhone() : "Unknown")
                )
                .email(delivery.getEmail())
                .phone(delivery.getPhone())
                .status(delivery.getStatus())
                .retryCount(delivery.getRetryCount())
                .errorMessage(delivery.getErrorMessage())
                .deliveredAt(delivery.getDeliveredAt())
                .build();
    }
}
