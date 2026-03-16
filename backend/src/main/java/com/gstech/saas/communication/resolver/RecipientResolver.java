package com.gstech.saas.communication.resolver;

import com.gstech.saas.communication.dto.Recipient;
import com.gstech.saas.communication.dto.RecipientRequest;

import java.util.List;

public interface RecipientResolver {

    List<Recipient> resolve(RecipientRequest request);
}