package com.gstech.saas.accounting.invoice.repository;

import com.gstech.saas.accounting.invoice.model.Invoice;
import com.gstech.saas.accounting.invoice.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUnitIdAndTenantIdOrderByInvoiceDateDesc(Long unitId, Long tenantId);

    List<Invoice> findByTenantIdAndInvoiceDateBetweenAndAssociationId(
            Long tenantId, LocalDate from, LocalDate to, Long associationId);

    List<Invoice> findByUnitIdAndTenantIdAndInvoiceDateBetween(
            Long unitId, Long tenantId, LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i " +
            "WHERE i.unitId = :unitId AND i.invoiceDate BETWEEN :from AND :to")
    BigDecimal sumTotalByUnitIdAndDateRange(
            @Param("unitId") Long unitId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Financial Summary Report queries
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i " +
            "WHERE i.tenantId = :tenantId " +
            "  AND i.associationId = COALESCE(:associationId, i.associationId) " +
            "  AND i.invoiceDate BETWEEN :from AND :to")
    BigDecimal sumTotalByAssociationIdAndDateRange(
            @Param("tenantId") Long tenantId,
            @Param("associationId") Long associationId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i " +
            "WHERE i.tenantId = :tenantId " +
            "  AND i.associationId = COALESCE(:associationId, i.associationId) " +
            "  AND i.status = :status " +
            "  AND i.invoiceDate BETWEEN :from AND :to")
    BigDecimal sumTotalByAssociationIdAndStatusAndDateRange(
            @Param("tenantId") Long tenantId,
            @Param("associationId") Long associationId,
            @Param("status") InvoiceStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Delinquency Report query
    List<Invoice> findByTenantIdAndAssociationIdAndStatus(
            Long tenantId,
            Long associationId,
            InvoiceStatus status);
}