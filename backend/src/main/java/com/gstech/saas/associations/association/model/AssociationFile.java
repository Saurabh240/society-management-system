package com.gstech.saas.associations.association.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "association_files")
@Getter
@Setter
@NoArgsConstructor
public class AssociationFile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "association_id", nullable = false)
    private Association association;

    @Column(nullable = false)
    private String fileName;

    @Column
    private String description;

    @Column(nullable = false)
    private Long fileSizeBytes;

    @Column(nullable = false)
    private String storagePath;

    @Column(nullable = false, updatable = false)
    private Instant uploadedAt;

    @PrePersist
    protected void onPrePersist() {
        super.onPrePersist();
        this.uploadedAt = Instant.now();
    }
}