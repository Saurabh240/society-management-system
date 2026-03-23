package com.gstech.saas.communication.provider;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import org.springframework.stereotype.Component;

@Component
public class TwilioSmsProvider extends SmsProvider {

    @Override
    public void send(Delivery delivery, Message message){

//        Message.creator(
//                new PhoneNumber(phone),
//                new PhoneNumber("+123456789"),
//                message
//        ).create();

    }
}
