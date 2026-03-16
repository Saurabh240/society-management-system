package com.gstech.saas.communication.worker;

import com.gstech.saas.communication.dto.Channel;
import com.gstech.saas.communication.dto.CommunicationEvent;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.provider.EmailProvider;
import com.gstech.saas.communication.provider.SmsProvider;
import com.gstech.saas.communication.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CommunicationWorker {

    private final DeliveryRepository deliveryRepository;
    private final EmailProvider emailProvider;
    private final SmsProvider smsProvider;

    @KafkaListener(
            topics = "communication.send",
            groupId = "communication-group"
    )
    public void process(CommunicationEvent event){

        Long messageId = event.getMessageId();

        System.out.println("Received message: " + messageId);

        List<Delivery> deliveries =
                deliveryRepository.findByMessageId(event.getMessageId());

        for(Delivery d : deliveries){

            if(d.getChannel() == Channel.EMAIL){

                emailProvider.send(
                        d.getEmail(),
                        "Test Subject",
                        "Test Body"
                );

            }

            if(d.getChannel() == Channel.SMS){

                smsProvider.send(
                        d.getPhone(),
                        "Test SMS"
                );

            }

        }

    }
}

