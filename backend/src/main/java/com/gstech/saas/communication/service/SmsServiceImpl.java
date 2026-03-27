package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import com.gstech.saas.communication.resolver.RecipientResolver;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SmsServiceImpl implements SmsService {

    private final MessageRepository messageRepository;
    private final DeliveryRepository deliveryRepository;
    private final RecipientResolver recipientResolver;
    private final CommunicationPublisher publisher;

    @Override
    public List<SmsResponse> listSms() {
        Long tenantId = TenantContext.get();
        Pageable pageable = PageRequest.of(0, 100, Sort.by("createdAt").descending());
        return messageRepository.findByTenantIdAndType(tenantId, Channel.SMS, pageable)
                .getContent()  // ← Page → List
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Long createSms(CreateMessageRequest request) {
        boolean isScheduled = request.getScheduledAt() != null;

        Message message = Message.builder()
                .associationId(request.getAssociationId())
                .type(Channel.SMS)                    // always SMS here
                .subject(request.getSubject())
                .body(request.getBody())
                .status(isScheduled ? MessageStatus.SCHEDULED : MessageStatus.SENT)
                .scheduledAt(request.getScheduledAt())
                .sentAt(isScheduled ? null : Instant.now())
                .templateId(request.getTemplateId())
                .build();
        message.setTenantId(TenantContext.get());

        messageRepository.save(message);

        List<Recipient> recipients = recipientResolver.resolve(request.getRecipient());
        List<Delivery> deliveries = new ArrayList<>();

        for (Recipient r : recipients) {
            Delivery d = new Delivery();
            d.setTenantId(TenantContext.get());
            d.setMessageId(message.getId());
            d.setPhone(r.getPhone());
            d.setChannel(Channel.SMS);
            d.setStatus(DeliveryStatus.PENDING);
            deliveries.add(d);
        }

        deliveryRepository.saveAll(deliveries);

        if (!isScheduled) {
            deliveries.forEach(d -> {
                CommunicationEvent event = new CommunicationEvent(
                        message.getId(),
                        d.getId(),
                        Channel.SMS
                );

                publisher.publish(event);
            });
        }

        return message.getId();
    }

    @Override
    public void resendSms(Long id) {
        Message message = findOrThrow(id);

        List<Recipient> recipients = recipientResolver.resolve(buildRecipientRequest(message));
        List<Delivery> deliveries = new ArrayList<>();

        for (Recipient r : recipients) {
            Delivery d = new Delivery();
            d.setTenantId(TenantContext.get());
            d.setMessageId(message.getId());
            d.setPhone(r.getPhone());
            d.setChannel(Channel.SMS);
            d.setStatus(DeliveryStatus.PENDING);
            deliveries.add(d);
        }

        message.setSentAt(Instant.now());
        message.setStatus(MessageStatus.SENT);
        messageRepository.save(message);

        deliveryRepository.saveAll(deliveries);
        deliveries.forEach(d -> {
            CommunicationEvent event = new CommunicationEvent(
                    message.getId(),
                    d.getId(),
                    Channel.SMS
            );

            publisher.publish(event);
        });
    }

    @Override
    public SmsResponse rescheduleSms(Long id, RescheduleRequest request) {
        Message message = findOrThrow(id);

        if (message.getStatus() != MessageStatus.SCHEDULED) {
            throw new IllegalStateException(
                    "Only SCHEDULED messages can be rescheduled (id=" + id + ")");
        }

        message.setScheduledAt(request.getScheduledAt());
        messageRepository.save(message);

        return toResponse(message); // ← return updated message
    }

    @Override
    public void deleteSms(Long id) {
        Message message = findOrThrow(id);
        List<Delivery> deliveries = deliveryRepository.findByMessageId(id);
        deliveryRepository.deleteAll(deliveries);
        messageRepository.delete(message);
    }
    @Override
    public void deleteSmsByIds(List<Long> ids) {
        for (Long id : ids) {
            deleteSms(id); // reuses existing deleteSms logic
        }
    }

    // ─────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────

    private Message findOrThrow(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "SMS message not found with id=" + id));
    }

    private RecipientRequest buildRecipientRequest(Message message) {
        RecipientRequest req = new RecipientRequest();
        req.setAssociationId(message.getAssociationId());
        req.setType(RecipientType.ALL_OWNERS);
        return req;
    }

    private SmsResponse toResponse(Message message) {
        List<String> phoneNumbers = deliveryRepository.findByMessageId(message.getId())
                .stream()
                .map(Delivery::getPhone)
                .toList();

        return new SmsResponse(
                message.getId(),
                message.getBody(),
                "Recipients",
                phoneNumbers,
                message.getStatus() == MessageStatus.SCHEDULED
                        ? message.getScheduledAt()
                        : message.getSentAt(),
                message.getStatus()
        );
    }
}
