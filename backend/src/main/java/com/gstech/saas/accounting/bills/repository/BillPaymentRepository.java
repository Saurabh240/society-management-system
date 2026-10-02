package com.gstech.saas.accounting.bills.repository;

import com.gstech.saas.accounting.bills.model.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
    List<BillPayment> findByBillIdOrderByPaymentDateDescIdDesc(Long billId);
}