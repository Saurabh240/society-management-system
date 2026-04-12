package com.gstech.saas.accounting.journal.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "journal_entries")
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

    private String memo;

    private String attachmentPath;

    @OneToMany(
            mappedBy = "journal",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<JournalLine> lines = new ArrayList<>();
}
