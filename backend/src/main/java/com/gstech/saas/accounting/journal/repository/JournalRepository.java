package com.gstech.saas.accounting.journal.repository;

import com.gstech.saas.accounting.journal.model.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long>,
        JpaSpecificationExecutor<Journal> {

}