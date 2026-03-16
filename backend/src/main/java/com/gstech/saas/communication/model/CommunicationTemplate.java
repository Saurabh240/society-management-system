package com.gstech.saas.communication.model;

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

    private String level;

    private String category;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    private LocalDateTime createdAt;

}
