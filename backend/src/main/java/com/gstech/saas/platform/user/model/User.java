package com.gstech.saas.platform.user.model;

import com.gstech.saas.platform.common.BaseEntity;
import com.gstech.saas.platform.security.Role;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Data
@Entity
@Getter
@Setter
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private Long tenantId;

    @Column(name = "temporary_password")
    private Boolean temporaryPassword = false;

    @Column(name = "temp_password_expiry")
    private Instant tempPasswordExpiry;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserStatus status;
}

