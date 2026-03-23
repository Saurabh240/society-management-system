package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.Channel;
import com.gstech.saas.communication.dto.CommunicationEvent;
import com.gstech.saas.communication.dto.MessageStatus;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessageScheduler {

    private final MessageRepository messageRepository;
    private final DeliveryRepository deliveryRepository;
    private final CommunicationPublisher publisher;

    /**
     * Runs every 60 seconds. Finds SCHEDULED messages whose scheduledAt
     * has passed and dispatches their existing Deliveries to Kafka.
     * fixedDelay ensures the next run starts 60s AFTER the previous one
     * finishes — avoids overlapping runs if a batch takes longer than 60s.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void dispatchScheduled() {
        List<Message> dueMessages = messageRepository
                .findByStatusAndScheduledAtBefore(MessageStatus.SCHEDULED, LocalDateTime.now());

        if (dueMessages.isEmpty()) {
            return;
        }

        log.info("[MessageScheduler] Dispatching {} scheduled message(s)", dueMessages.size());

        for (Message message : dueMessages) {
            try {
                dispatch(message);
            } catch (Exception ex) {
                // Log and continue — don't let one failure block the rest of the batch
                log.error("[MessageScheduler] Failed to dispatch messageId={}: {}",
                        message.getId(), ex.getMessage(), ex);
            }
        }
    }

    private void dispatch(Message message) {
        // Mark as SENT before publishing to prevent re-dispatch on next tick
        message.setStatus(MessageStatus.SENT);
        message.setSentAt(Instant.now());
        messageRepository.save(message);

        // Deliveries were already created at schedule time — fetch and publish them
        List<Delivery> deliveries = deliveryRepository.findByMessageId(message.getId());

        if (deliveries.isEmpty()) {
            log.warn("[MessageScheduler] No deliveries found for messageId={}", message.getId());
            return;
        }

        Channel channel = message.getType();

        for (Delivery delivery : deliveries) {
            publisher.publish(new CommunicationEvent(
                    message.getId(), delivery.getId(), channel));
        }

        log.info("[MessageScheduler] Published {} deliveries for messageId={}",
                deliveries.size(), message.getId());
    }
}