package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.*;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.queue.CommunicationPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import com.gstech.saas.communication.resolver.RecipientResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunicationServiceImpl {

    private final MessageRepository messageRepository;
    private final DeliveryRepository deliveryRepository;
    private final RecipientResolver resolver;
    private final DeliveryGenerator generator;
    private final CommunicationPublisher publisher;

    public Long send(CreateMessageRequest request){

        Message message = new Message();
        message.setSubject(request.getSubject());
        message.setBody(request.getBody());
        message.setType(request.getChannel());

        messageRepository.save(message);

        List<Recipient> recipients =
                resolver.resolve(request.getRecipient());

        List<Delivery> deliveries =
                generator.generate(message, recipients, request.getChannel());

        deliveryRepository.saveAll(deliveries);

        for(Delivery d : deliveries){

            publisher.publish(
                    new CommunicationEvent(
                            message.getId(),
                            d.getId(),
                            request.getChannel()
                    )
            );
        }

        return message.getId();
    }
}

