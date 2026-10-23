package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Structured association address used to render the "From" block of a physical
 * mailing so it can be laid out line-by-line, the same way the recipient
 * ("To") address is laid out — see {@code MailingPdfService}.
 */
@Data
@Builder
public class AssociationAddressDto {

    private String street;
    private String city;
    private String state;
    private String zipCode;
}
