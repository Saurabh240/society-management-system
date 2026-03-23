package com.gstech.saas.associations.vendor.repository;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import com.gstech.saas.associations.vendor.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByTenantId(Long tenantId);

    List<Vendor> findByTenantIdAndStatus(Long tenantId, VendorStatus status);
}