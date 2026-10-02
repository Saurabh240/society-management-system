package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.DeliveryDetailDto;
import com.gstech.saas.communication.dto.DeliverySummary;
import com.gstech.saas.communication.model.Delivery;
import java.util.List;

public final class DeliverySummaryMapper {

    private DeliverySummaryMapper() {}

    public static DeliverySummary summarize(List<Delivery> deliveries) {
        if (deliveries == null || deliveries.isEmpty()) {
            return DeliverySummary.EMPTY;
        }

        int delivered = 0, pending = 0, failed = 0;
        for (Delivery d : deliveries) {
            switch (d.getStatus()) {
                case DELIVERED -> delivered++;
                case PENDING, RETRYING -> pending++;
                case FAILED, DLQ -> failed++;
            }
        }

        return new DeliverySummary(deliveries.size(), delivered, pending, failed);
    }

    public static List<DeliveryDetailDto> toDetailDtos(List<Delivery> deliveries) {
        return deliveries.stream()
                .map(d -> new DeliveryDetailDto(
                        d.getId(),
                        d.getEmail() != null ? d.getEmail() : d.getPhone(),
                        d.getStatus(),
                        d.getRetryCount(),
                        d.getErrorMessage(),
                        d.getDeliveredAt()
                ))
                .toList();
    }
}