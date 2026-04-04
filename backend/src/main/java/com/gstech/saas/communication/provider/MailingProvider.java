package com.gstech.saas.communication.provider;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import org.springframework.stereotype.Component;

@Component
public class MailingProvider implements CommunicationProvider {

    @Override
    public void send(Delivery delivery, Message message){

        System.out.println("MAILING created");

    }
}