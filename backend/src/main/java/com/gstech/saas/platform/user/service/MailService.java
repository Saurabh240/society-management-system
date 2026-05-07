package com.gstech.saas.platform.user.service;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.MailjetRequest;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.resource.Emailv31;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Value("${communication.mailjet.api-key}")
    private String apiKey;

    @Value("${communication.mailjet.api-secret}")
    private String apiSecret;

    @Value("${communication.mailjet.from-email}")
    private String fromEmail;

    @Value("${communication.mailjet.from-name}")
    private String fromName;

    public void sendInviteEmail(String toEmail, String name, String resetLink) {

        ClientOptions options = ClientOptions.builder()
                .apiKey(apiKey)
                .apiSecretKey(apiSecret)
                .build();

        MailjetClient client = new MailjetClient(options);

        JSONObject message = new JSONObject();
        message.put("From", new JSONObject()
                .put("Email", fromEmail)
                .put("Name", fromName));

        message.put("To", new JSONArray()
                .put(new JSONObject()
                        .put("Email", toEmail)
                        .put("Name", name)));

        message.put("Subject", "You're invited - Set your password");
        message.put("TextPart",
                "Hello " + name + ",\n\n" +
                        "Click the link below to set your password:\n\n" +
                        resetLink +
                        "\n\nThis link expires in 24 hours.");

        MailjetRequest request = new MailjetRequest(Emailv31.resource)
                .property(Emailv31.MESSAGES, new JSONArray().put(message));

        try {
            client.post(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
