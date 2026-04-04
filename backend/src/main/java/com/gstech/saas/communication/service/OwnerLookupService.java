package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.OwnerDto;

import java.util.List;

public interface OwnerLookupService {

    List<OwnerDto> findOwnersByAssociation(Long associationId);

    String getAssociationName(Long associationId);
}