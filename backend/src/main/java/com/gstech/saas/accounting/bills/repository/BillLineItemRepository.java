package com.gstech.saas.accounting.bills.repository;

import com.gstech.saas.accounting.bills.model.BillLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillLineItemRepository
        extends JpaRepository<BillLineItem, Long> {

    List<BillLineItem> findByBillId(Long billId);
}
