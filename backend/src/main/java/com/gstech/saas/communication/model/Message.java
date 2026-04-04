package com.gstech.saas.communication.model;

import com.gstech.saas.communication.dto.Channel;
import com.gstech.saas.communication.dto.MessageStatus;
import com.gstech.saas.communication.dto.RecipientType;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name="communication_messages")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long associationId;

    @Enumerated(EnumType.STRING)
    private Channel type;

    private String subject;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private Instant scheduledAt;

    private Instant sentAt;

    private Long templateId;

    private String recipientLabel;
}
