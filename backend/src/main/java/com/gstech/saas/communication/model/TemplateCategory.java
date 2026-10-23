package com.gstech.saas.communication.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@Table(name = "template_categories")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TemplateCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String categoryName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
