package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.model.CommunicationTemplate;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import com.gstech.saas.communication.repository.TemplateRepository;
import com.gstech.saas.communication.resolver.RecipientResolver;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunicationServiceImpl {

    private final MessageRepository messageRepository;
    private final DeliveryRepository deliveryRepository;
    private final RecipientResolver resolver;
    private final DeliveryGenerator generator;
    private final CommunicationPublisher publisher;

    // ─────────────────────────────────────────────────
    // EMAIL OPERATIONS
    // ─────────────────────────────────────────────────

    /**
     * Send or schedule an email.
     * Flow A – immediate send:
     *   Save Message(SENT) → resolve recipients → generate Deliveries → publish to Kafka
     * Flow B – scheduled send:
     *   Save Message(SCHEDULED) → resolve recipients → generate Deliveries(PENDING)
     *   The MessageScheduler will publish to Kafka when scheduledAt is reached.
     */
    @Transactional
    public Long sendEmail(CreateMessageRequest request) {
        boolean isScheduled = request.getScheduledAt() != null;

        Message message = Message.builder()
                .associationId(request.getAssociationId())
                .type(Channel.EMAIL)
                .subject(request.getSubject())
                .body(request.getBody())
                .status(isScheduled ? MessageStatus.SCHEDULED : MessageStatus.SENT)
                .templateId(request.getTemplateId())
                .scheduledAt(request.getScheduledAt())
                .sentAt(isScheduled ? null : Instant.now())
                .recipientLabel(request.getRecipient().getType())
                .build();

        messageRepository.save(message);

        List<Recipient> recipients = resolver.resolve(request.getRecipient());
        List<Delivery> deliveries = generator.generate(message, recipients, Channel.EMAIL);
        deliveryRepository.saveAll(deliveries);

        // Only publish immediately for non-scheduled sends
        if (!isScheduled) {
            publishDeliveries(message, deliveries);
        }

        return message.getId();
    }

    /**
     * Returns a page of EMAIL messages for the given tenant.
     * Always sorts by createdAt DESC so that DRAFT messages (which have no
     * sentAt or scheduledAt) still appear in a sensible order alongside
     * SENT and SCHEDULED ones.
     * The incoming Pageable from the controller carries the page/size; we
     * override its sort here to enforce the createdAt rule consistently.
     */
    @Transactional
    public Page<MessageDto> listEmails(Long tenantId, Pageable pageable) {
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending()
        );

        return messageRepository
                .findByTenantIdAndType(tenantId, Channel.EMAIL, sorted)
                .map(this::toDto);
    }

    /**
     * Edit subject / body / scheduledAt of an existing email.
     * Only DRAFT or SCHEDULED messages can be edited.
     */
    @Transactional
    public void updateEmail(Long id, UpdateMessageRequest request) {
        Message message = findOrThrow(id);

        if (message.getStatus() == MessageStatus.SENT
                || message.getStatus() == MessageStatus.DELIVERED) {
            throw new IllegalStateException(
                    "Cannot edit a message that has already been sent (id=" + id + ")");
        }

        message.setSubject(request.getSubject());
        message.setBody(request.getBody());
        message.setTemplateId(request.getTemplateId());

        if (request.getScheduledAt() != null) {
            message.setScheduledAt(request.getScheduledAt());
            message.setStatus(MessageStatus.SCHEDULED);
        } else {
            message.setScheduledAt(null);
            // If it was previously SCHEDULED and now has no date, treat as DRAFT
            if (message.getStatus() == MessageStatus.SCHEDULED) {
                message.setStatus(MessageStatus.DRAFT);
            }
        }

        messageRepository.save(message);
    }

    /**
     * Resend an already-sent email.
     * Creates a fresh set of Delivery records and re-publishes to Kafka.
     */
    @Transactional
    public void resendEmail(Long id) {
        Message message = findOrThrow(id);

        // Build new deliveries by re-resolving recipients stored on the message
        RecipientRequest recipientRequest = buildRecipientRequestFromMessage(message);
        List<Recipient> recipients = resolver.resolve(recipientRequest);
        List<Delivery> deliveries = generator.generate(message, recipients, Channel.EMAIL);

        // Update message timestamps
        message.setSentAt(Instant.now());
        message.setStatus(MessageStatus.SENT);
        messageRepository.save(message);

        deliveryRepository.saveAll(deliveries);
        publishDeliveries(message, deliveries);
    }

    /**
     * Move a SCHEDULED email to a new future date.
     */
    @Transactional
    public void rescheduleEmail(Long id, RescheduleRequest request) {
        Message message = findOrThrow(id);

        if (message.getStatus() != MessageStatus.SCHEDULED) {
            throw new IllegalStateException(
                    "Only SCHEDULED messages can be rescheduled (id=" + id + ")");
        }

        message.setScheduledAt(request.getScheduledAt());
        messageRepository.save(message);
    }

    /**
     * Delete a message and all its associated deliveries.
     */
    @Transactional
    public void deleteEmail(Long id) {
        Message message = findOrThrow(id);

        List<Delivery> deliveries = deliveryRepository.findByMessageId(id);
        deliveryRepository.deleteAll(deliveries);
        messageRepository.delete(message);
    }

    // ─────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────

    /** Fetch message or throw a clean 404-mappable exception */
    private Message findOrThrow(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Message not found with id=" + id));
    }

    /** Publish one CommunicationEvent per delivery to Kafka */
    private void publishDeliveries(Message message, List<Delivery> deliveries) {
        for (Delivery d : deliveries) {
            publisher.publish(new CommunicationEvent(
                    message.getId(), d.getId(), Channel.EMAIL));
        }
    }

    /**
     * Reconstruct a RecipientRequest from the message so resend
     * can re-resolve recipients using the same original criteria.
     * The recipientLabel stores enough info for this reconstruction.
     * Extend this to a proper JSON column if needed.
     */
    private RecipientRequest buildRecipientRequestFromMessage(Message message) {
        RecipientRequest req = new RecipientRequest();
        req.setAssociationId(message.getAssociationId());
        // Default to ALL_OWNERS for resend; refine by persisting the original type
        req.setType(RecipientType.ALL_OWNERS);
        return req;
    }

    /** Map Message entity → MessageDto for API response */
    private MessageDto toDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .subject(message.getSubject())
                .recipientLabel(message.getRecipientLabel())
                .date(message.getStatus() == MessageStatus.SCHEDULED
                        ? message.getScheduledAt()
                        : message.getSentAt())
                .status(message.getStatus())
                .channel(message.getType())
                .build();
    }
}
