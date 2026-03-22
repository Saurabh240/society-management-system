package com.gstech.saas.communication.provider;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;

public interface CommunicationProvider {

    void send(Delivery delivery, Message message);

}