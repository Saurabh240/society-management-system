package com.gstech.saas.communication.provider;

public interface EmailProvider {

    void send(String to, String subject, String body);
}
