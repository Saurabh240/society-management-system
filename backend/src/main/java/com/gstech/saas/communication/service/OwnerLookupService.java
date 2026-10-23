package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.AssociationAddressDto;
import com.gstech.saas.communication.dto.OwnerDto;

import java.util.List;

public interface OwnerLookupService {

    List<OwnerDto> findOwnersByAssociation(Long associationId);

    String getAssociationName(Long associationId);

    /** Returns formatted "Street, City, State ZIP" for the From block in mailing PDFs. */
    String getAssociationAddress(Long associationId);

    /**
     * Returns the association's address broken into individual fields so the
     * "From" block of a mailing PDF can be laid out line-by-line, the same way
     * the recipient's ("To") address is laid out.
     */
    AssociationAddressDto getAssociationAddressDetails(Long associationId);
}