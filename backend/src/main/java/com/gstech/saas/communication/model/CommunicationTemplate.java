package com.gstech.saas.communication.model;

import com.gstech.saas.communication.dto.Level;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="communication_templates")
public class CommunicationTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
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
}
