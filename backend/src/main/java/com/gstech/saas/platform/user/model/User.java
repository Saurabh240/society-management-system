package com.gstech.saas.platform.user.model;

import com.gstech.saas.platform.common.BaseEntity;
import com.gstech.saas.platform.security.Role;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private Long tenantId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;
}

