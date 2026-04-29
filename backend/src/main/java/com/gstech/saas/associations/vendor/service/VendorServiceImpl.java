package com.gstech.saas.associations.vendor.service;

import com.gstech.saas.associations.vendor.dtos.VendorRequest;
import com.gstech.saas.associations.vendor.dtos.VendorResponse;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;

    @Override
    @Transactional
    public VendorResponse createVendor(VendorRequest request) {

        Long tenantId = TenantContext.get();

        if (vendorRepository.existsByTenantIdAndEmail(tenantId, request.email())) {
            throw new RuntimeException("Vendor with email already exists");
        }

        Vendor vendor = Vendor.builder()
                .companyName(request.companyName())
                .contactName(request.contactName())
                .email(request.email())
                .phone(request.phone())
                .altEmail(request.altEmail())
                .altPhone(request.altPhone())
                .street(request.street())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .status(request.status())
                .serviceCategory(request.serviceCategory())
                .build();

        return mapToResponse(vendorRepository.save(vendor));
    }

    @Override
    @Transactional
    public VendorResponse updateVendor(Long id, VendorRequest request) {

        Vendor vendor = getVendorEntity(id);

        vendor.setCompanyName(request.companyName());
        vendor.setContactName(request.contactName());
        vendor.setEmail(request.email());
        vendor.setPhone(request.phone());
        vendor.setAltEmail(request.altEmail());
        vendor.setAltPhone(request.altPhone());
        vendor.setStreet(request.street());
        vendor.setCity(request.city());
        vendor.setState(request.state());
        vendor.setZipCode(request.zipCode());
        vendor.setStatus(request.status());
        vendor.setServiceCategory(request.serviceCategory());

        return mapToResponse(vendorRepository.save(vendor));
    }

    @Override
    public VendorResponse getVendorById(Long id) {
        return mapToResponse(getVendorEntity(id));
    }

    @Override
    @Transactional
    public void deleteVendor(Long id) {
        vendorRepository.delete(getVendorEntity(id));
    }

    private Vendor getVendorEntity(Long id) {
        Long tenantId = TenantContext.get();
        return vendorRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    private VendorResponse mapToResponse(Vendor v) {
        return new VendorResponse(
                v.getId(),
                v.getCompanyName(),
                v.getContactName(),
                v.getEmail(),
                v.getPhone(),
                v.getAltEmail(),
                v.getAltPhone(),
                v.getStreet(),
                v.getCity(),
                v.getState(),
                v.getZipCode(),
                v.getStatus(),
                v.getServiceCategory(),
                v.getCreatedAt(),
                v.getUpdatedAt()
        );
    }
}