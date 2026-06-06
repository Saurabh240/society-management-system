package com.gstech.saas.associations.vendor.repository;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import com.gstech.saas.associations.vendor.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByTenantId(Long tenantId);

    List<Vendor> findByTenantIdAndStatus(Long tenantId, VendorStatus status);

    Optional<Vendor> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndEmail(Long tenantId, String email);

    void deleteAllByIdInAndTenantId(List<Long> ids, Long tenantId);

    @Query("""
    SELECT v FROM Vendor v
    WHERE v.tenantId = :tenantId
      AND v.id IN :ids
""")
    List<Vendor> findByTenantIdAndIdIn(
            @Param("tenantId") Long tenantId,
            @Param("ids") Collection<Long> ids
    );
}