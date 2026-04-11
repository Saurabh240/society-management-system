package com.gstech.saas.accounting.journal.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "journal_entries",
        indexes = {
                @Index(name = "idx_journal_entries_tenant",  columnList = "tenant_id"),
                @Index(name = "idx_journal_entries_assoc",   columnList = "tenant_id, association_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Journal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String memo;

    // Lines are saved via cascade — do not set manually
    @OneToMany(mappedBy = "journal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JournalLine> lines = new ArrayList<>();
}