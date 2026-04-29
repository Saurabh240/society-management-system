package com.gstech.saas.associations.vendor.controller;

import com.gstech.saas.associations.vendor.dtos.VendorRequest;
import com.gstech.saas.associations.vendor.dtos.VendorResponse;
import com.gstech.saas.associations.vendor.enums.VendorStatus;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.associations.vendor.service.VendorService;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {

    private final VendorRepository vendorRepository;
    private final VendorService vendorService;

    public VendorController(VendorRepository vendorRepository ,VendorService vendorService) {
        this.vendorRepository = vendorRepository;
        this.vendorService = vendorService;
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
    /**
     * POST /api/v1/vendors
     */
    @Operation(
            summary = "Create a new vendor",
            description = "Creates a new vendor with company, contact, and address details"
    )
    @PostMapping
    public ResponseEntity<VendorResponse> createVendor(
            @Valid @RequestBody VendorRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(vendorService.createVendor(request));
    }
    /**
     * PUT /api/v1/vendors/{id}
     */
    @Operation(
            summary = "Update a vendor",
            description = "Updates an existing vendor's details by ID"
    )
    @PutMapping("/{id}")
    public ResponseEntity<VendorResponse> updateVendor(
            @PathVariable Long id,
            @Valid @RequestBody VendorRequest request) {

        return ResponseEntity.ok(vendorService.updateVendor(id, request));
    }
    /**
     * GET /api/v1/vendors/{id}
     */
    @Operation(
            summary = "Get vendor by ID",
            description = "Fetch a single vendor by its unique ID"
    )
    @GetMapping("/{id}")
    public ResponseEntity<VendorResponse>getVendorById(@PathVariable Long id){
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }
    /**
     * DELETE /api/v1/vendors/{id} → 204 No Content
     */
    @Operation(
            summary ="Delete a vendor",
            description = "Delete a vendor by id")
    @DeleteMapping("/{id}")
            public ResponseEntity<Void>deleteVendor(@PathVariable Long id){
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

}

