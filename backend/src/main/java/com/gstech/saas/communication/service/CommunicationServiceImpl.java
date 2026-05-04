package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.MailingRecipient;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import com.gstech.saas.communication.repository.MailingRecipientRepository;
import com.gstech.saas.communication.resolver.RecipientResolver;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunicationServiceImpl implements CommunicationService {

    private final MessageRepository messageRepository;
    private final DeliveryRepository deliveryRepository;
    private final RecipientResolver resolver;
    private final DeliveryGenerator generator;
    private final CommunicationPublisher publisher;
    private final OwnerLookupService ownerLookupService;
    private final MailingRecipientRepository mailingRecipientRepository;

    /**
     * If specific ownerIds were provided, return only those owners.
     * Otherwise, fetch all owners for the association.
     */
    public List<OwnerDto> resolveOwners(CreateMailingRequest request) {
        boolean specificOwnersSelected = request.getOwnerIds() != null
                && !request.getOwnerIds().isEmpty();

        List<OwnerDto> allOwners =
                ownerLookupService.findOwnersByAssociation(request.getAssociationId());

        if (specificOwnersSelected) {
            return allOwners.stream()
                    .filter(o -> request.getOwnerIds().contains(o.getOwnerId()))
                    .collect(Collectors.toList());
        }

        return allOwners;
    }

    // ─────────────────────────────────────────────────
    // OWNERS FOR CHECKBOX LIST
    // ─────────────────────────────────────────────────

    @Override
    @Transactional
    public List<OwnerDto> getOwnersByAssociation(Long associationId) {
        return ownerLookupService.findOwnersByAssociation(associationId);
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
     * Reconstruct a RecipientRequest from the stored mailing_recipient rows.
     * recipientLabel tells us the type; the MailingRecipient rows give us
     * the exact ownerIds that were selected originally.
     */
    private RecipientRequest buildRecipientRequestFromMessage(Message message) {
        RecipientRequest req = new RecipientRequest();
        req.setAssociationId(message.getAssociationId());

        // ── FIX: read the original type from what was saved on send ──────────
        String storedLabel = message.getRecipientLabel(); // e.g. "SPECIFIC_OWNERS"
        RecipientType originalType = parseRecipientType(storedLabel);
        req.setType(originalType);
        // ── FIX: if specific owners were selected, restore their IDs too ─────
        if (originalType == RecipientType.OWNER) {
            List<MailingRecipient> rows =
                    mailingRecipientRepository.findByMessageId(message.getId());

            List<Long> ownerIds = rows.stream()
                    .map(MailingRecipient::getOwnerId)
                    .filter(id -> id != null)
                    .collect(Collectors.toList());

            req.setOwnerIds(ownerIds);
        }

        return req;
    }
    /**
     * Safely parse the stored recipientLabel string back to RecipientType.
     * Falls back to ALL_OWNERS if the value is missing or unrecognised.
     */
    private RecipientType parseRecipientType(String label) {
        if (label == null || label.isBlank()) {
            return RecipientType.ALL_OWNERS;
        }
        try {
            return RecipientType.valueOf(label.toUpperCase());
        } catch (IllegalArgumentException e) {
            return RecipientType.ALL_OWNERS; // safe default
        }
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
