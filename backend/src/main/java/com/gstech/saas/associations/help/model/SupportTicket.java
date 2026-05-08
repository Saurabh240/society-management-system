package com.gstech.saas.associations.help.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "support_tickets",
        indexes = {
                @Index(name = "idx_support_tickets_tenant_id",   columnList = "tenant_id"),
                @Index(name = "idx_support_tickets_tenant_user", columnList = "tenant_id, user_id")
        }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicket extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SupportTicketStatus status = SupportTicketStatus.OPEN;
}