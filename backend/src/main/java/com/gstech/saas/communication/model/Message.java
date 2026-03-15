package com.gstech.saas.communication.model;

import com.gstech.saas.communication.dto.MessageStatus;
import com.gstech.saas.communication.dto.MessageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="communication_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    private Long associationId;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    private String subject;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private LocalDateTime scheduledAt;

    private LocalDateTime sentAt;

    private Long templateId;

}
