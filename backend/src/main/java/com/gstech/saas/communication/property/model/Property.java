package com.gstech.saas.communication.property.model;

import java.time.Instant;

import com.gstech.saas.platform.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "properties")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Property extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(name = "community_id")
    private Long communityId;
    @Column(name = "updated_at")
    private Instant updatedAt;
}
