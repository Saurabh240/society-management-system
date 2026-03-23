package com.gstech.saas.communication.resolver;

import com.gstech.saas.communication.dto.Recipient;
import com.gstech.saas.communication.dto.RecipientRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RecipientResolverImpl implements RecipientResolver {

    @Override
    public List<Recipient> resolve(RecipientRequest request) {

        // MOCK DATA FOR TEST

        List<Recipient> list = new ArrayList<>();

        list.add(
                Recipient.builder()
                        .email("saurabh58833@gmail.com")
                        .phone("+911234567890")
                        .build()
        );

        return list;
    }

}