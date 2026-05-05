package com.gstech.saas.associations.vendor.service;

import com.gstech.saas.associations.vendor.dtos.VendorRequest;
import com.gstech.saas.associations.vendor.dtos.VendorResponse;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
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
                .firstName(request.firstName())
                .lastName(request.lastName())
                .companyName(request.companyName())
                .serviceCategory(request.serviceCategory())
                .email(request.email())
                .altEmail(request.altEmail())
                .mobilePhone(request.mobilePhone())
                .workPhone(request.workPhone())
                .homePhone(request.homePhone())
                .website(request.website())
                .street(request.street())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .country(request.country())
                .taxIdentityType(request.taxIdentityType())
                .taxPayerId(request.taxPayerId())
                .insuranceProvider(request.insuranceProvider())
                .policyNumber(request.policyNumber())
                .insuranceExpiry(request.insuranceExpiry())
                .notes(request.notes())
                .status(request.status())
                .build();

        return toResponse(vendorRepository.save(vendor));
    }

    @Override
    @Transactional
    public VendorResponse updateVendor(Long id, VendorRequest request) {

        Vendor v = findOrThrow(id);
        v.setFirstName(request.firstName());
        v.setLastName(request.lastName());
        v.setCompanyName(request.companyName());
        v.setServiceCategory(request.serviceCategory());
        v.setEmail(request.email());
        v.setAltEmail(request.altEmail());
        v.setMobilePhone(request.mobilePhone());
        v.setWorkPhone(request.workPhone());
        v.setHomePhone(request.homePhone());
        v.setWebsite(request.website());
        v.setStreet(request.street());
        v.setCity(request.city());
        v.setState(request.state());
        v.setZipCode(request.zipCode());
        v.setCountry(request.country());
        v.setTaxIdentityType(request.taxIdentityType());
        v.setTaxPayerId(request.taxPayerId());
        v.setInsuranceProvider(request.insuranceProvider());
        v.setPolicyNumber(request.policyNumber());
        v.setInsuranceExpiry(request.insuranceExpiry());
        v.setNotes(request.notes());
        v.setStatus(request.status());
        return toResponse(vendorRepository.save(v));
    }

    @Override
    public VendorResponse getVendorById(Long id) {

        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public void deleteVendor(Long id) {

        vendorRepository.delete(findOrThrow(id));
    }

    private Vendor getVendorEntity(Long id) {
        Long tenantId = TenantContext.get();
        return vendorRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }
    private Vendor findOrThrow(Long id) {
        Long tenantId = TenantContext.get();
        return vendorRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found: " + id));
    }

    private VendorResponse toResponse(Vendor v) {
        return new VendorResponse(
                v.getId(),
                v.getFirstName(), v.getLastName(),
                v.getCompanyName(), v.getServiceCategory(),
                v.getEmail(), v.getAltEmail(),
                v.getMobilePhone(), v.getWorkPhone(), v.getHomePhone(),
                v.getWebsite(),
                v.getStreet(), v.getCity(), v.getState(),
                v.getZipCode(), v.getCountry(),
                v.getTaxIdentityType(), v.getTaxPayerId(),
                v.getInsuranceProvider(), v.getPolicyNumber(), v.getInsuranceExpiry(),
                v.getNotes(), v.getStatus(),
                v.getCreatedAt()
        );
    }
}