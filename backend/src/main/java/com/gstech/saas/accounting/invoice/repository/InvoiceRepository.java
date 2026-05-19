package com.gstech.saas.accounting.invoice.repository;

import com.gstech.saas.accounting.invoice.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUnitIdAndTenantIdOrderByInvoiceDateDesc(Long unitId, Long tenantId);
}