package com.gstech.saas.communication.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "template_categories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "name"}))
public class TemplateCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}