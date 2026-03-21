package com.gstech.saas.communication.provider;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProviderRouter {

    private final MailjetEmailProvider emailProvider;
    private final SmsProvider smsProvider;
    private final MailingProvider mailingProvider;

    public void route(Delivery delivery, Message message){

        switch (delivery.getChannel()) {

            case EMAIL:
                emailProvider.send(delivery, message);
                break;

            case SMS:
                smsProvider.send(delivery, message);
                break;

            case MAILING:
                mailingProvider.send(delivery, message);
                break;
        }
    }
}