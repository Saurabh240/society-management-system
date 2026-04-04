package com.gstech.saas.communication.resolver;

import com.gstech.saas.associations.owner.model.UnitOwner;
import com.gstech.saas.associations.owner.repository.UnitOwnerRepository;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.communication.dto.Recipient;
import com.gstech.saas.communication.dto.RecipientRequest;
import com.gstech.saas.communication.dto.RecipientType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecipientResolverImpl implements RecipientResolver {

    private final UnitOwnerRepository unitOwnerRepository;
    private final VendorRepository vendorRepository;

    @Override
    public List<Recipient> resolve(RecipientRequest request) {
        List<Recipient> results = new ArrayList<>();

        // ── Step 1: resolve owner-type recipients ─────────────────────
        results.addAll(resolveOwners(request));

        // ── Step 2: append vendor recipients if specified ─────────────
        results.addAll(resolveVendors(request));

        log.info("[RecipientResolver] resolved={} for associationId={} type={}",
                results.size(), request.getAssociationId(), request.getType());

        return results;
    }

    // ─────────────────────────────────────────────────────────────────
    // OWNER RESOLUTION
    // ─────────────────────────────────────────────────────────────────

    private List<Recipient> resolveOwners(RecipientRequest request) {

        // Specific owner IDs selected (from checkbox list in UI)
        if (!CollectionUtils.isEmpty(request.getOwnerIds())) {
            return unitOwnerRepository
                    .findActiveOwnersByOwnerIds(request.getOwnerIds())
                    .stream()
                    .map(uo -> Recipient.builder()
                            .ownerId(uo.getOwner().getId())
                            .email(uo.getOwner().getEmail())
                            .phone(uo.getOwner().getPhone())
                            .build())
                    .distinct()   // same owner linked to multiple units → deduplicate
                    .toList();
        }

        // Broadcast types — resolve from association
        if (request.getAssociationId() == null) return List.of();

        RecipientType type = request.getType();

        if (type == null || type == RecipientType.ALL_OWNERS || type == RecipientType.OWNER) {
            return unitOwnerRepository
                    .findActiveOwnersByAssociationId(request.getAssociationId())
                    .stream()
                    .map(uo -> Recipient.builder()
                            .ownerId(uo.getOwner().getId())
                            .email(uo.getOwner().getEmail())
                            .phone(uo.getOwner().getPhone())
                            .build())
                    .distinct()
                    .toList();
        }

        if (type == RecipientType.BOARD_MEMBERS) {
            return unitOwnerRepository
                    .findBoardMembersByAssociationId(request.getAssociationId())
                    .stream()
                    .map(uo -> Recipient.builder()
                            .ownerId(uo.getOwner().getId())
                            .email(uo.getOwner().getEmail())
                            .phone(uo.getOwner().getPhone())
                            .build())
                    .toList();
        }

        if (type == RecipientType.ALL_RESIDENTS) {
            // Residents = owners + renters from Unit table
            List<Recipient> owners = unitOwnerRepository
                    .findActiveOwnersByAssociationId(request.getAssociationId())
                    .stream()
                    .map(uo -> Recipient.builder()
                            .ownerId(uo.getOwner().getId())
                            .email(uo.getOwner().getEmail())
                            .phone(uo.getOwner().getPhone())
                            .build())
                    .toList();

            // Renters live on the Unit entity — include if email present
            List<Recipient> renters = unitOwnerRepository
                    .findActiveOwnersByAssociationId(request.getAssociationId())
                    .stream()
                    .map(UnitOwner::getUnit)
                    .distinct()
                    .filter(u -> u.getRenterEmail() != null)
                    .map(u -> Recipient.builder()
                            .email(u.getRenterEmail())
                            .phone(u.getRenterPhone())
                            .build())
                    .toList();

            List<Recipient> all = new ArrayList<>(owners);
            all.addAll(renters);
            return all;
        }

        return List.of();
    }

    // ─────────────────────────────────────────────────────────────────
    // VENDOR RESOLUTION
    // ─────────────────────────────────────────────────────────────────

    private List<Recipient> resolveVendors(RecipientRequest request) {
        if (CollectionUtils.isEmpty(request.getVendorIds())) return List.of();

        return vendorRepository.findAllById(request.getVendorIds())
                .stream()
                .map(v -> Recipient.builder()
                        .email(v.getEmail())
                        .phone(v.getPhone())
                        .build())
                .toList();
    }
}