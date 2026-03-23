package com.gstech.saas.communication.config;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MailjetConfig {

    @Value("${communication.mailjet.api-key}")
    private String apiKey;

    @Value("${communication.mailjet.api-secret}")
    private String apiSecret;

    /**
     * Register as a singleton — the Mailjet SDK docs explicitly recommend
     * reusing one client instance to reduce connection overhead.
     */
    @Bean
    public MailjetClient mailjetClient() {
        ClientOptions options = ClientOptions.builder()
                .apiKey(apiKey)
                .apiSecretKey(apiSecret)
                .build();
        return new MailjetClient(options);
    }
}