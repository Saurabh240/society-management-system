package com.gstech.saas.communication.provider;

public interface SmsProvider {

    void send(String phone, String message);
}
