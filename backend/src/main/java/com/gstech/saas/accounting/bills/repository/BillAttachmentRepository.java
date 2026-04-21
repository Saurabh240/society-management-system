package com.gstech.saas.accounting.bills.repository;

import com.gstech.saas.accounting.bills.model.BillAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillAttachmentRepository extends JpaRepository<BillAttachment, Long> {

    List<BillAttachment> findByBillIdAndTenantId(Long billId, Long tenantId);

    long countByBillIdAndTenantId(Long billId, Long tenantId);

    Optional<BillAttachment> findByIdAndBillIdAndTenantId(Long id, Long billId, Long tenantId);
}