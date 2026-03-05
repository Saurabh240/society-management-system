package com.gstech.saas.communication.owner.model;

import java.util.Set;

import com.gstech.saas.platform.common.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "owners")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class Owner extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "primary_street")
    private String primaryStreet;

    @Column(name = "primary_city")
    private String primaryCity;

    @Column(name = "primary_state")
    private String primaryState;

    @Column(name = "primary_zip")
    private String primaryZip;

    @Column(name = "alt_street")
    private String altStreet;

    @Column(name = "alt_city")
    private String altCity;

    @Column(name = "alt_state")
    private String altState;

    @Column(name = "alt_zip")
    private String altZip;

    @Column(name = "email")
    private String email;

    @Column(name = "alt_email")
    private String altEmail;

    @Column(name = "phone")
    private String phone;

    @Column(name = "alt_phone")
    private String altPhone;

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<UnitOwner> unitOwners;
}
