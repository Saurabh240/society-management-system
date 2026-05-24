package com.gstech.saas.accounting.journal.repository;

import com.gstech.saas.accounting.journal.model.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Journal repository.
 *
 * Filtered queries use JournalSpecification + JpaSpecificationExecutor
 * (already wired in JournalService.list()) — no raw JPQL needed here.
 *
 * The previous findFiltered() JPQL query used IS NULL OR on nullable Long/Date
 * params, which causes PostgreSQL to throw
 * "could not determine data type of parameter $1" when nulls are passed.
 * That method has been removed. JournalService.list() already calls
 * journalRepository.findAll(JournalSpecification.withFilters(...), pageable)
 * which handles null params safely via Criteria API.
 */
@Repository
public interface JournalRepository extends JpaRepository<Journal, Long>,
        JpaSpecificationExecutor<Journal> {

    // No custom queries needed here.
    // All filtering is done through JournalSpecification in JournalService.
}