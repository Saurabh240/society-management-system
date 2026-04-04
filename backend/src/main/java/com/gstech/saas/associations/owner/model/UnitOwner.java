package com.gstech.saas.associations.owner.model;

import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.associations.owner.enums.BoardDesignation;

import com.gstech.saas.platform.common.BaseEntity;
import com.gstech.saas.platform.exception.OwnerExceptions;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import org.springframework.http.HttpStatus;

@Entity
@Table(name = "unit_owners",
        indexes = {
                @Index(name = "idx_unit_owners_unit_id", columnList = "unit_id"),
                @Index(name = "idx_unit_owners_owner_id", columnList = "owner_id")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uq_unit_owners_unit_owner",
                columnNames = {"unit_id", "owner_id"}
        )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitOwner extends BaseEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "unit_id", nullable = false)
        private Unit unit;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "owner_id", nullable = false)
        private Owner owner;

        @Column(nullable = false)
        @Builder.Default
        private boolean isBoardMember = false;

        @Enumerated(EnumType.STRING)
        @Column
        private BoardDesignation designation;

        @Column
        private LocalDate termStartDate;

        @Column
        private LocalDate termEndDate;

        @Column(nullable = false)
        @Builder.Default
        private boolean isActive = true;

        // Domain method — keeps board member clearing logic in one place
        public void clearBoardMemberInfo() {
                this.isBoardMember = false;
                this.designation = null;
                this.termStartDate = null;
                this.termEndDate = null;
        }

        // Domain validation — called before save, not scattered in service
        public void validateBoardMemberFields() {
                if (!this.isBoardMember) return;
                if (this.designation == null) {
                        throw new OwnerExceptions("Designation is required for board members", HttpStatus.BAD_REQUEST);
                }
                if (this.termStartDate == null || this.termEndDate == null) {
                        throw new OwnerExceptions("Term start and end dates are required for board members", HttpStatus.BAD_REQUEST);
                }
                if (this.termEndDate.isBefore(this.termStartDate)) {
                        throw new OwnerExceptions("Term end date cannot be before start date", HttpStatus.BAD_REQUEST);
                }
        }
}
