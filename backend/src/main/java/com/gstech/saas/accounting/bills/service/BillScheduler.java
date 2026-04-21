package com.gstech.saas.accounting.bills.service;

import com.gstech.saas.accounting.bills.repository.BillRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillScheduler {

    private final BillRepository billRepository;

    /**
     * Runs every 60 seconds
     * Marks UNPAID bills as OVERDUE if dueDate < today
     */

        @Scheduled(fixedDelay = 60_000)
        @Transactional
        public void markOverdue() {

            log.info("Checking overdue bills...");

            int updated = billRepository.markOverdue(LocalDate.now());

            log.info("Updated {} bills to OVERDUE", updated);
        }
    }
