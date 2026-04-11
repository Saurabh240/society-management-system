package com.gstech.saas.accounting.journal.repository;

import com.gstech.saas.accounting.journal.model.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {

    List<Journal> findByTenantIdOrderByDateDesc(Long tenantId);

    Optional<Journal> findByIdAndTenantId(Long id, Long tenantId);
}
