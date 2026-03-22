package com.gstech.saas.communication.provider;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SendGridEmailProvider extends EmailProvider {

    private final SendGrid sendGrid;

    @Override
    public void send(Delivery delivery, Message message){

        Email from = new Email("noreply@test.com");
        Email toEmail = new Email(delivery.getEmail());

        Content content = new Content("text/plain", message.getBody());

        Mail mail = new Mail(from, message.getSubject(), toEmail, content);

        Request request = new Request();

        try{

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            sendGrid.api(request);

        }catch(Exception ex){

            ex.printStackTrace();

        }

    }
}

