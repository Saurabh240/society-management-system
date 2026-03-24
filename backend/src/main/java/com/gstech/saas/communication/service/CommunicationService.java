package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.CreateMailingRequest;
import com.gstech.saas.communication.dto.OwnerDto;

import java.util.List;

public interface CommunicationService {

    /** Owners for the checkbox list — delegates to the association/ownership domain */
    List<OwnerDto> getOwnersByAssociation(Long associationId);

    List<OwnerDto> resolveOwners(CreateMailingRequest request);
}