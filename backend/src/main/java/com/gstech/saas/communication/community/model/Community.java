package com.gstech.saas.communication.community.model;

import com.gstech.saas.platform.common.BaseEntity;
import com.gstech.saas.platform.tenant.model.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Table(name = "communities")
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Community extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String name;
    private String status;

    @Column(name = "tenant_id")
    private Long tenantId;
    @Column(name = "updated_at")
    private Instant updatedAt;
}
