package com.gstech.saas.accounting.journal.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gstech.saas.accounting.journal.model.Journal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {

    @Query("""
        SELECT j FROM Journal j
        WHERE j.tenantId = :tenantId
          AND (:associationId IS NULL OR j.associationId = :associationId)
          AND (:from IS NULL OR j.date >= :from)
          AND (:to IS NULL OR j.date <= :to)
        ORDER BY j.date DESC
    """)
    Page<Journal> findFiltered(
            @Param("tenantId") Long tenantId,
            @Param("associationId") Long associationId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable
    );
}

