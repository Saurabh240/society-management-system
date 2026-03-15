package com.gstech.saas.communication.provider;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SendGridEmailProvider implements EmailProvider {

    private final SendGrid sendGrid;

    @Override
    public void send(String to,String subject,String body){

        Email from = new Email("noreply@test.com");
        Email toEmail = new Email(to);

        Content content = new Content("text/plain", body);

        Mail mail = new Mail(from, subject, toEmail, content);

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

