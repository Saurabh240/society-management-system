package com.gstech.saas.associations.vendor.controller;

import com.gstech.saas.associations.vendor.enums.VendorStatus;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {

    private final VendorRepository vendorRepository;

    public VendorController(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    @GetMapping
    public ResponseEntity<List<Vendor>> getActiveVendorsForTenant() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Vendor> vendors = vendorRepository.findByTenantIdAndStatus(tenantId, VendorStatus.ACTIVE);
        return ResponseEntity.ok(vendors);
    }
}

