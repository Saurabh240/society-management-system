package com.gstech.saas.communication.queue;

import com.gstech.saas.communication.dto.CommunicationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommunicationQueuePublisher {

    private final KafkaTemplate<String,Object> kafkaTemplate;

    public void publish(Long messageId){

        kafkaTemplate.send(
                "communication.send",
                new CommunicationEvent(messageId, "EMAIL")
        );

    }
}

