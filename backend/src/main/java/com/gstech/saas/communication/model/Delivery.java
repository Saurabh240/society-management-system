package com.gstech.saas.communication.model;

import com.gstech.saas.communication.dto.Channel;
import com.gstech.saas.communication.dto.DeliveryStatus;
import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="communication_deliveries")
@Data
public class Delivery extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long messageId;

    private Long ownerId;

    private Long vendorId;

    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Channel channel;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private Integer retryCount = 0;

    private String errorMessage;

    private LocalDateTime deliveredAt;
}
