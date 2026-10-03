package com.gstech.saas.associations.vendor.service;

import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.associations.vendor.dtos.VendorRequest;
import com.gstech.saas.associations.vendor.dtos.VendorResponse;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final CoaRepository coaRepository;

    @Override
    @Transactional
    public VendorResponse createVendor(VendorRequest request) {

        Long tenantId = TenantContext.get();

        if (vendorRepository.existsByTenantIdAndEmail(tenantId, request.email())) {
            throw new RuntimeException("Vendor with email already exists");
        }

        validateVendorRequest(request, tenantId);

        Coa defaultExpenseAccount = null;
        if (request.defaultExpenseAccountId() != null) {
            defaultExpenseAccount = coaRepository.findByIdAndTenantId(request.defaultExpenseAccountId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Chart of Account not found: " + request.defaultExpenseAccountId()));
        }

        Vendor vendor = Vendor.builder()
                .isCompany(request.isCompany())
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
                .defaultExpenseAccount(defaultExpenseAccount)
                .status(request.status())
                .build();

        return toResponse(vendorRepository.save(vendor));
    }

    @Override
    @Transactional
    public VendorResponse updateVendor(Long id, VendorRequest request) {

        Long tenantId = TenantContext.get();
        Vendor v = findOrThrow(id);

        validateVendorRequest(request, tenantId);

        Coa defaultExpenseAccount = null;
        if (request.defaultExpenseAccountId() != null) {
            defaultExpenseAccount = coaRepository.findByIdAndTenantId(request.defaultExpenseAccountId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Chart of Account not found: " + request.defaultExpenseAccountId()));
        }

        v.setIsCompany(request.isCompany());
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
        v.setDefaultExpenseAccount(defaultExpenseAccount);
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
    @Override
    @Transactional
    public void deleteBatch(List<Long> ids) {
        Long tenantId = TenantContext.get();

        List<Vendor> vendors = vendorRepository.findAllById(ids)
                .stream()
                .filter(v -> v.getTenantId().equals(tenantId))  // security: only delete own tenant's vendors
                .toList();

        if (vendors.isEmpty()) {
            throw new EntityNotFoundException("No vendors found for the given ids");
        }

        vendorRepository.deleteAll(vendors);
        log.info("Batch deleted {} vendors for tenantId={}", vendors.size(), tenantId);
    }

    private void validateVendorRequest(VendorRequest request, Long tenantId) {
        if (request.isCompany()) {
            // For company vendors: companyName is required, firstName/lastName are optional
            if (request.companyName() == null || request.companyName().isBlank()) {
                throw new IllegalArgumentException("Company name is required for company vendors (isCompany=true)");
            }
        } else {
            // For individual vendors: firstName and lastName are required, companyName is optional
            if (request.firstName() == null || request.firstName().isBlank()) {
                throw new IllegalArgumentException("First name is required for individual vendors (isCompany=false)");
            }
            if (request.lastName() == null || request.lastName().isBlank()) {
                throw new IllegalArgumentException("Last name is required for individual vendors (isCompany=false)");
            }
        }
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
                v.getIsCompany(),
                v.getFirstName(), v.getLastName(),
                v.getCompanyName(), v.getServiceCategory(),
                v.getEmail(), v.getAltEmail(),
                v.getMobilePhone(), v.getWorkPhone(), v.getHomePhone(),
                v.getWebsite(),
                v.getStreet(), v.getCity(), v.getState(),
                v.getZipCode(), v.getCountry(),
                v.getTaxIdentityType(), v.getTaxPayerId(),
                v.getInsuranceProvider(), v.getPolicyNumber(), v.getInsuranceExpiry(),
                v.getDefaultExpenseAccount() != null ? v.getDefaultExpenseAccount().getId() : null,
                v.getNotes(), v.getStatus(),
                v.getCreatedAt()
        );
    }
}