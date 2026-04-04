package com.gstech.saas.communication.model;

import com.gstech.saas.communication.dto.Level;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="communication_templates")
@Data
public class CommunicationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long tenantId;
    private String name;
    @Enumerated(EnumType.STRING)
    private Level level;
    private String category;
    private String description;
    private String recipientType;
    private String subject;
    @Column(columnDefinition = "TEXT")
    private String body;
    @Column(columnDefinition = "TEXT")
    private String content;
    private LocalDateTime createdAt;

}
