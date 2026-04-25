package com.gstech.saas.communication.provider;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TwilioSmsProvider extends SmsProvider {

    /**
     * IMPORTANT — Twilio credential types:
     *
     *  twilio.account-sid  → Your Account SID from console.twilio.com/dashboard
     *                        Always starts with "AC", e.g. AC1234abcd...
     *                        NOT an API Key SID (SK...) — those are different.
     *
     *  twilio.auth-token   → Auth Token from the same dashboard page.
     *
     *  twilio.phone-number → Twilio-purchased number in E.164 format: +1XXXXXXXXXX
     *                        Must be SMS-capable. Indian numbers need a local number
     *                        or an approved international sender ID.
     */
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhone;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
        log.info("[Twilio] Initialized with accountSid={} fromPhone={}",
                maskSid(accountSid), fromPhone);
    }

    @Override
    public void send(Delivery delivery, Message message) {
        String toPhone = delivery.getPhone();

        if (toPhone == null || toPhone.isBlank()) {
            log.warn("[Twilio] Skipping delivery id={} — phone number is null/empty", delivery.getId());
            throw new RuntimeException("Cannot send SMS: recipient phone number is missing for deliveryId=" + delivery.getId());
        }

        try {
            com.twilio.rest.api.v2010.account.Message sent =
                    com.twilio.rest.api.v2010.account.Message
                            .creator(
                                    new PhoneNumber(toPhone),
                                    new PhoneNumber(fromPhone),
                                    message.getBody()
                            )
                            .create();

            log.info("[Twilio] SMS sent deliveryId={} to={} twilioSid={} status={}",
                    delivery.getId(), toPhone, sent.getSid(), sent.getStatus());

        } catch (ApiException ex) {
            log.error("[Twilio] API error deliveryId={} to={} code={} message={}",
                    delivery.getId(), toPhone, ex.getCode(), ex.getMessage());
            throw new RuntimeException(
                    "Twilio send failed (code=" + ex.getCode() + "): " + ex.getMessage(), ex);
        }
    }

    private String maskSid(String sid) {
        if (sid == null || sid.length() < 6) return "***";
        return sid.substring(0, 6) + "***";
    }
}