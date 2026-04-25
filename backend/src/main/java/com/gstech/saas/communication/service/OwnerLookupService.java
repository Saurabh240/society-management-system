package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.OwnerDto;

import java.util.List;

public interface OwnerLookupService {

    List<OwnerDto> findOwnersByAssociation(Long associationId);

    String getAssociationName(Long associationId);

    /** Returns formatted "Street, City, State ZIP" for the From block in mailing PDFs. */
    String getAssociationAddress(Long associationId);
}