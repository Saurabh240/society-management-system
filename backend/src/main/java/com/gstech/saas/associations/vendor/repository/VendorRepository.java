package com.gstech.saas.associations.vendor.repository;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import com.gstech.saas.associations.vendor.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByTenantId(Long tenantId);

    List<Vendor> findByTenantIdAndStatus(Long tenantId, VendorStatus status);

    Optional<Vendor> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndEmail(Long tenantId, String email);
}