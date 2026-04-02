package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
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
     * Reconstruct a RecipientRequest from the message so resend
     * can re-resolve recipients using the same original criteria.
     * The recipientLabel stores enough info for this reconstruction.
     * Extend this to a proper JSON column if needed.
     */
    private RecipientRequest buildRecipientRequestFromMessage(Message message) {
        RecipientRequest req = new RecipientRequest();
        req.setAssociationId(message.getAssociationId());
        // Default to ALL_OWNERS for resend; refine by persisting the original type
        req.setType("ALL_OWNERS");
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
