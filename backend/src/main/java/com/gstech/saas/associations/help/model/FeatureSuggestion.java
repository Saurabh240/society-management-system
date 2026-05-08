package com.gstech.saas.associations.help.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "feature_suggestions",
        indexes = {
                @Index(name = "idx_feature_suggestions_tenant_id",   columnList = "tenant_id"),
                @Index(name = "idx_feature_suggestions_tenant_user", columnList = "tenant_id, user_id")
        }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureSuggestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
}