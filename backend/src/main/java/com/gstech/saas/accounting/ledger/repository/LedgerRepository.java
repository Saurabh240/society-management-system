package com.gstech.saas.accounting.ledger.repository;

import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.model.Ledger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

    /**
     * Single query handles all filter combinations.
     * Each param is optional — passing null skips that filter.
     */
    @Repository
    public interface LedgerRepository extends JpaRepository<Ledger, Long>,
            JpaSpecificationExecutor<Ledger> {
    }
