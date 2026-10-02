package com.gstech.saas.accounting.journal.model;

import com.gstech.saas.accounting.ledger.dto.LineBasis;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "journal_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_id", nullable = false)
    private Journal journal;

    @Column(nullable = false)
    private Long accountId;

    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 30)
    private com.gstech.saas.accounting.ledger.dto.LedgerSourceType sourceType;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "basis", nullable = false, length = 10)
    private LineBasis basis = LineBasis.BOTH;
}