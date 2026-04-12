package com.gstech.saas.accounting.journal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gstech.saas.accounting.journal.model.JournalLine;

public interface JournalLineRepository extends JpaRepository<JournalLine, Long> {
}
