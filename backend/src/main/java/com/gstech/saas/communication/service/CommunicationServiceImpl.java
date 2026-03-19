package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.model.CommunicationTemplate;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationQueuePublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import com.gstech.saas.communication.repository.TemplateRepository;
import com.gstech.saas.communication.resolver.RecipientResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.gstech.saas.communication.dto.MessageType.EMAIL;

@Service
@RequiredArgsConstructor
public class CommunicationServiceImpl implements CommunicationService {

    private final MessageRepository messageRepository;
    private final DeliveryRepository deliveryRepository;
    private final RecipientResolver recipientResolver;
    private final CommunicationQueuePublisher publisher;
    private final TemplateRepository templateRepository;

    @Override
    public Long createEmail(CreateEmailRequest request) {

        Message message = Message.builder()
                .type(EMAIL)
                .subject(request.getSubject())
                .body(request.getBody())
                .status(MessageStatus.DRAFT)
                .associationId(request.getAssociationId())
                .build();

        messageRepository.save(message);

        List<Recipient> recipients =
                recipientResolver.resolve(request.getRecipient());

        List<Delivery> deliveries = new ArrayList<>();

        for(Recipient r : recipients){

            Delivery d = new Delivery();

            d.setMessageId(message.getId());
            d.setEmail(r.getEmail());
            d.setPhone(r.getPhone());
            d.setChannel(Channel.EMAIL);
            d.setStatus(DeliveryStatus.PENDING);

            deliveries.add(d);

        }

        deliveryRepository.saveAll(deliveries);

        return message.getId();
    }

    @Override
    public void sendNow(Long messageId) {

        publisher.publish(messageId);

    }

    @Override
    public List<TemplateResponse> getTemplates(String level) {

        List<CommunicationTemplate> templates;

        if (level != null) {
            templates = templateRepository.findByLevel(level);
        } else {
            templates = templateRepository.findAll();
        }

        return templates.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TemplateResponse createTemplate(CreateTemplateRequest request) {

        CommunicationTemplate template = new CommunicationTemplate();

        template.setTenantId(request.getTenantId());
        template.setName(request.getName());
        template.setLevel(request.getLevel());
        template.setCategory(request.getCategory());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());
        template.setCreatedAt(LocalDateTime.now());

        CommunicationTemplate saved = templateRepository.save(template);

        return mapToResponse(saved);
    }
    @Override
    public TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request) {

        CommunicationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setName(request.getName());
        template.setLevel(request.getLevel());
        template.setCategory(request.getCategory());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());

        CommunicationTemplate updated = templateRepository.save(template);

        return mapToResponse(updated);
    }
    @Override
    public void deleteTemplate(Long id) {

        templateRepository.deleteById(id);

    }
    private TemplateResponse mapToResponse(CommunicationTemplate template) {

        return TemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .level(template.getLevel())
                .category(template.getCategory())
                .lastModified(template.getCreatedAt())
                .build();
    }
}

