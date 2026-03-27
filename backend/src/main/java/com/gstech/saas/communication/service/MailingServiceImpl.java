package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.MailingRecipient;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MailingRecipientRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailingServiceImpl implements MailingService {

    private final MessageRepository messageRepository;
    private final DeliveryRepository deliveryRepository;
    private final MailingRecipientRepository mailingRecipientRepository;
    private final CommunicationPublisher publisher;
    private final CommunicationService communicationService;

    // ─────────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────────

    @Override
    @Transactional
    public Page<MailingDto> listMailings(Long tenantId, Pageable pageable) {
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending()
        );

        return messageRepository
                .findByTenantIdAndType(tenantId, Channel.MAILING, sorted)
                .map(this::toListDto);
    }

    // ─────────────────────────────────────────────────
    // GET DETAIL  (Edit form population)
    // ─────────────────────────────────────────────────

    @Override
    @Transactional
    public MailingDetailDto getMailingById(Long id) {
        Message message = findOrThrow(id);

        List<MailingRecipient> recipients =
                mailingRecipientRepository.findByMessageId(id);

        List<Long> ownerIds = recipients.stream()
                .map(MailingRecipient::getOwnerId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        RecipientType recipientType = recipients.isEmpty()
                ? RecipientType.ALL_OWNERS
                : recipients.get(0).getRecipientType();

        Long associationId = recipients.isEmpty()
                ? message.getAssociationId()
                : recipients.get(0).getAssociationId();

        return MailingDetailDto.builder()
                .id(message.getId())
                .title(message.getTitle())
                .content(message.getBody())
                .recipientType(recipientType)
                .associationId(associationId)
                .ownerIds(ownerIds)
                .recipientLabel(message.getRecipientLabel())
                .templateId(message.getTemplateId())
                .date(message.getSentAt() != null
                        ? message.getSentAt()
                        : message.getCreatedAt())
                .status(message.getStatus())
                .build();
    }

    // ─────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────

    @Override
    @Transactional
    public Long createMailing(CreateMailingRequest request) {
        List<OwnerDto> resolvedOwners = communicationService.resolveOwners(request);

        Message message = Message.builder()
                .associationId(request.getAssociationId())
                .type(Channel.MAILING)
                .title(request.getTitle())
                .body(request.getContent())
                .status(MessageStatus.DELIVERED)
                .templateId(request.getTemplateId())
                .sentAt(Instant.now())
                .recipientLabel(String.valueOf(request.getRecipientType()))
                .build();

        messageRepository.save(message);

        saveMailingRecipients(message.getId(), request);
        createAndPublishDeliveries(message, resolvedOwners);

        log.info("[Mailing] Created mailingId={} recipients={} title={}",
                message.getId(), resolvedOwners.size(), request.getTitle());

        return message.getId();
    }

    // ─────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────

    @Override
    @Transactional
    public void updateMailing(Long id, CreateMailingRequest request) {
        Message message = findOrThrow(id);

        List<OwnerDto> resolvedOwners = communicationService.resolveOwners(request);

        message.setTitle(request.getTitle());
        message.setBody(request.getContent());
        message.setAssociationId(request.getAssociationId());
        message.setTemplateId(request.getTemplateId());
        message.setRecipientLabel(String.valueOf(request.getRecipientType()));
        messageRepository.save(message);

        // Replace recipient rows
        mailingRecipientRepository.deleteByMessageId(id);
        saveMailingRecipients(id, request);

        // Replace deliveries
        deliveryRepository.deleteAll(deliveryRepository.findByMessageId(id));
        createAndPublishDeliveries(message, resolvedOwners);

        log.info("[Mailing] Updated mailingId={} recipients={}", id, resolvedOwners.size());
    }

    // ─────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteMailing(Long id) {
        Message message = findOrThrow(id);

        mailingRecipientRepository.deleteByMessageId(id);
        deliveryRepository.deleteAll(deliveryRepository.findByMessageId(id));
        messageRepository.delete(message);

        log.info("[Mailing] Deleted mailingId={}", id);
    }

    // ─────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────

    private Message findOrThrow(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Mailing not found with id=" + id));
    }

    /**
     * Persist one MailingRecipient row per selected owner
     * (or a single broadcast row for non-specific types).
     */
    private void saveMailingRecipients(Long messageId, CreateMailingRequest request) {
        boolean isSpecific = request.getOwnerIds() != null
                && !request.getOwnerIds().isEmpty();

        if (isSpecific) {
            List<MailingRecipient> rows = request.getOwnerIds().stream()
                    .map(ownerId -> MailingRecipient.builder()
                            .messageId(messageId)
                            .recipientType(request.getRecipientType())
                            .associationId(request.getAssociationId())
                            .ownerId(ownerId)
                            .build())
                    .collect(Collectors.toList());
            mailingRecipientRepository.saveAll(rows);
        } else {
            // Broadcast — store a single row with no ownerId
            mailingRecipientRepository.save(MailingRecipient.builder()
                    .messageId(messageId)
                    .recipientType(request.getRecipientType())
                    .associationId(request.getAssociationId())
                    .build());
        }
    }
    @Override
    @Transactional
    public void deleteMailingsByIds(List<Long> ids) {
        for (Long id : ids) {
            deleteMailing(id); // reuses existing deleteMailing logic
        }
    }

    /**
     * Create one Delivery per owner and publish each to Kafka
     * so MailingProvider handles the physical dispatch.
     */
    private void createAndPublishDeliveries(Message message, List<OwnerDto> owners) {
        List<Delivery> deliveries = owners.stream()
                .map(owner -> {
                    Delivery d = new Delivery();
                    d.setMessageId(message.getId());
                    d.setEmail(owner.getEmail());
                    d.setChannel(Channel.MAILING);
                    d.setStatus(DeliveryStatus.PENDING);
                    return d;
                })
                .collect(Collectors.toList());

        deliveryRepository.saveAll(deliveries);

        deliveries.forEach(d ->
                publisher.publish(new CommunicationEvent(
                        message.getId(), d.getId(), Channel.MAILING)));
    }

    /**
     * Builds the display string shown in the Recipient column.
     * e.g. "Sunset Village (2 owners)"
     */
//    private String buildRecipientLabel(CreateMailingRequest request, List<OwnerDto> owners) {
//        String associationName =
//                ownerLookupService.getAssociationName(request.getAssociationId());
//        return associationName + " (" + owners.size() + " owner"
//                + (owners.size() == 1 ? "" : "s") + ")";
//    }

    private MailingDto toListDto(Message message) {
        return MailingDto.builder()
                .id(message.getId())
                .title(message.getTitle())
                .recipientLabel(RecipientType.valueOf(message.getRecipientLabel()))
                .date(message.getSentAt() != null
                        ? message.getSentAt()
                        : message.getCreatedAt())
                .status(message.getStatus())
                .build();
    }
}