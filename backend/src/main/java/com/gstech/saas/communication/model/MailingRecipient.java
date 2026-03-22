package com.gstech.saas.communication.model;

import com.gstech.saas.communication.dto.MailingRecipientType;
import com.gstech.saas.communication.dto.RecipientType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "communication_mailing_recipients", indexes = {
        @Index(name = "idx_mailing_recipient_msg", columnList = "message_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MailingRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_type", nullable = false)
    private RecipientType recipientType;

    /**
     * Null when recipientType is ALL_RESIDENTS or BOARD_MEMBERS
     * (broadcast — no individual selection).
     */
    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "association_id", nullable = false)
    private Long associationId;
}