package com.gstech.saas.communication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunicationEvent {

    private Long messageId;
    private Long deliveryId;
    private Channel type;

}
