package com.gstech.saas.communication.owner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.gstech.saas.communication.unit.model.Unit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "unit_owners", indexes = {
                @Index(name = "idx_unit_owner_unit_id", columnList = "unit_id"),
                @Index(name = "idx_unit_owner_owner_id", columnList = "owner_id")
}, uniqueConstraints = {
                @UniqueConstraint(name = "unit_owner_unique_constraint", columnNames = { "unit_id", "owner_id" })
})
@SuperBuilder
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class UnitOwner {

        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE)
        private Long id;

        @JsonBackReference
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "unit_id", referencedColumnName = "id")
        private Unit unit;

        @JsonBackReference
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "owner_id", referencedColumnName = "id")
        private Owner owner;

        @Builder.Default
        @Column(name = "is_board_member")
        private Boolean isBoardMember = false;
}
