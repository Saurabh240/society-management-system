package com.gstech.saas.communication.service;

import com.gstech.saas.associations.association.repository.AssociationRepository;
import com.gstech.saas.associations.owner.repository.UnitOwnerRepository;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.communication.dto.RecipientOptionsResponse;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipientOptionsService {

    private final AssociationRepository associationRepository;
    private final UnitOwnerRepository unitOwnerRepository;
    private final VendorRepository vendorRepository;

    @Transactional
    public RecipientOptionsResponse getOptions(Long associationId) {
        return RecipientOptionsResponse.builder()
                .associations(loadAssociations())
                .owners(associationId != null ? loadOwners(associationId) : null)
                .vendors(loadVendors())
                .build();
    }

    private List<RecipientOptionsResponse.AssociationOption> loadAssociations() {
        return associationRepository.findByTenantId(TenantContext.get())
                .stream()
                .map(a -> RecipientOptionsResponse.AssociationOption.builder()
                        .id(a.getId())
                        .name(a.getName())
                        .ownerCount(a.getTotalUnits())
                        .build())
                .toList();
    }

    private List<RecipientOptionsResponse.OwnerOption> loadOwners(Long associationId) {
        return unitOwnerRepository
                .findActiveOwnersByAssociationId(associationId)
                .stream()
                .map(uo -> RecipientOptionsResponse.OwnerOption.builder()
                        .ownerId(uo.getOwner().getId())
                        .name(uo.getOwner().getFirstName() + " " + uo.getOwner().getLastName())
                        .unitNumber(uo.getUnit().getUnitNumber())
                        .email(uo.getOwner().getEmail())
                        .phone(uo.getOwner().getPhone())
                        .build())
                .toList();
    }

    private List<RecipientOptionsResponse.VendorOption> loadVendors() {
        return vendorRepository.findByTenantId(TenantContext.get())
                .stream()
                .map(v -> RecipientOptionsResponse.VendorOption.builder()
                        .vendorId(v.getId())
                        .companyName(v.getCompanyName())
                        .contactName(v.getContactName())
                        .email(v.getEmail())
                        .phone(v.getPhone())
                        .build())
                .toList();
    }
}