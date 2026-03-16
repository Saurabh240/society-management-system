package com.gstech.saas.communication.provider;

import org.springframework.stereotype.Component;

@Component
public class TwilioSmsProvider implements SmsProvider {

    @Override
    public void send(String phone,String message){

//        Message.creator(
//                new PhoneNumber(phone),
//                new PhoneNumber("+123456789"),
//                message
//        ).create();

    }

}
