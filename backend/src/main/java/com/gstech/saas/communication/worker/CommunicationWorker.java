package com.gstech.saas.communication.worker;

import com.gstech.saas.communication.dto.CommunicationEvent;
import com.gstech.saas.communication.dto.DeliveryStatus;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.provider.ProviderRouter;
import com.gstech.saas.communication.queue.DlqPublisher;
import com.gstech.saas.communication.queue.RetryPublisher;
import com.gstech.saas.communication.repository.DeliveryRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CommunicationWorker {

    private final DeliveryRepository deliveryRepository;
    private final MessageRepository messageRepository;
    private final ProviderRouter router;
    private final RetryPublisher retryPublisher;
    private final DlqPublisher dlqPublisher;

    @KafkaListener(topics = "communication.send")
    public void consume(CommunicationEvent event){
        handle(event);
    }

    @KafkaListener(topics = "communication.retry")
    public void retry(CommunicationEvent event){
        handle(event);
    }

    private void handle(CommunicationEvent event){

        Delivery delivery =
                deliveryRepository.findById(event.getDeliveryId()).orElseThrow();

        Message message =
                messageRepository.findById(event.getMessageId()).orElseThrow();

        try{

            router.route(delivery, message);

            delivery.setStatus(DeliveryStatus.DELIVERED);
            delivery.setDeliveredAt(LocalDateTime.now());

        }catch(Exception ex){

            delivery.setRetryCount(delivery.getRetryCount()+1);

            if(delivery.getRetryCount() < 3){

                delivery.setStatus(DeliveryStatus.RETRYING);
                retryPublisher.publish(event);

            }else{

                delivery.setStatus(DeliveryStatus.DLQ);
                dlqPublisher.publish(event);

            }

            delivery.setErrorMessage(ex.getMessage());
        }

        deliveryRepository.save(delivery);
    }
}

