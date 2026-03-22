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



}

