package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.Channel;
import com.gstech.saas.communication.dto.DeliveryStatus;
import com.gstech.saas.communication.dto.Recipient;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DeliveryGenerator {

    public List<Delivery> generate(
            Message message,
            List<Recipient> recipients,
            Channel channel){

        List<Delivery> list = new ArrayList<>();

        for(Recipient r : recipients){

            Delivery d = new Delivery();

            d.setMessageId(message.getId());
            d.setEmail(r.getEmail());
            d.setPhone(r.getPhone());
            d.setChannel(Channel.EMAIL);
            d.setStatus(DeliveryStatus.PENDING);

            list.add(d);
        }

        return list;
    }
}