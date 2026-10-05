package com.gstech.saas.accounting.invoice.repository;

import com.gstech.saas.accounting.invoice.model.InvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvoicePaymentRepository extends JpaRepository<InvoicePayment, Long> {
    List<InvoicePayment> findByInvoiceIdOrderByPaymentDateDescIdDesc(Long invoiceId);

    Optional<InvoicePayment> findByTenantIdAndInvoiceIdAndIdempotencyKey(
            Long tenantId, Long invoiceId, String idempotencyKey);
}