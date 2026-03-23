package com.gstech.saas.communication.provider;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.MailjetRequest;
import com.mailjet.client.MailjetResponse;
import com.mailjet.client.resource.Emailv31;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailjetEmailProvider extends EmailProvider {

    private final MailjetClient mailjetClient;

    @Value("${communication.mailjet.from-email}")
    private String fromEmail;

    @Value("${communication.mailjet.from-name:HOA Admin}")
    private String fromName;

    @Override
    public void send(Delivery delivery, Message message) {
        try {
            MailjetRequest request = new MailjetRequest(Emailv31.resource)
                    .property(Emailv31.MESSAGES, new JSONArray()
                            .put(new JSONObject()
                                    .put(Emailv31.Message.FROM, new JSONObject()
                                            .put("Email", fromEmail)
                                            .put("Name", fromName))
                                    .put(Emailv31.Message.TO, new JSONArray()
                                            .put(new JSONObject()
                                                    .put("Email", delivery.getEmail())))
                                    .put(Emailv31.Message.SUBJECT, message.getSubject())
                                    .put(Emailv31.Message.HTMLPART, message.getBody())));

            MailjetResponse response = mailjetClient.post(request);

            if (response.getStatus() != 200) {
                log.error("[Mailjet] Send failed for deliveryId={} to={} status={} data={}",
                        delivery.getId(), delivery.getEmail(),
                        response.getStatus(), response.getData());
                throw new RuntimeException(
                        "Mailjet returned status " + response.getStatus()
                                + ": " + response.getData());
            }

            log.info("[Mailjet] Email sent deliveryId={} to={} messageId={}",
                    delivery.getId(), delivery.getEmail(), message.getId());

        } catch (Exception ex) {
            // Rethrow so CommunicationWorker can apply retry / DLQ logic
            throw new RuntimeException("Mailjet send failed: " + ex.getMessage(), ex);
        }
    }
}