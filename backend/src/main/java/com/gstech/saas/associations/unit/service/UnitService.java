package com.gstech.saas.associations.unit.service;

import java.util.List;
import java.util.Optional;

import com.gstech.saas.associations.unit.model.OccupancyStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.associations.association.model.Association;
import com.gstech.saas.associations.association.repository.AssociationRepository;
import com.gstech.saas.associations.owner.dtos.OwnerListResponseType;
import com.gstech.saas.associations.owner.model.Owner;
import com.gstech.saas.associations.unit.dtos.UnitDetailedResponse;
import com.gstech.saas.associations.unit.dtos.UnitResponse;
import com.gstech.saas.associations.unit.dtos.UnitSaveRequest;
import com.gstech.saas.associations.unit.dtos.UnitUpdateRequest;
import com.gstech.saas.associations.unit.dtos.UpdateOccupancyRequest;
import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.associations.unit.repository.UnitRepository;
import com.gstech.saas.platform.audit.model.AuditEvent;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.UnitExceptions;
import com.gstech.saas.platform.subscription.service.SubscriptionService;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UnitService {

    private static final String ENTITY = "UNIT";   // static final

    private final UnitRepository unitRepository;
    private final AssociationRepository associationRepository;
    private final AuditService auditService;
    private final SubscriptionService subscriptionService;

    @Transactional
    public UnitResponse save(UnitSaveRequest request, Long userId) {
        Long tenantId = requireTenantId();
        checkUnitLimit(tenantId);

        Association association = associationRepository.findById(request.associationId())
                .orElseThrow(() -> new UnitExceptions("Association not found", HttpStatus.NOT_FOUND));

        if (!association.getTenantId().equals(tenantId)) {
            throw new UnitExceptions("Association does not belong to this tenant", HttpStatus.FORBIDDEN);
        }

        if (unitRepository.existsByAssociationIdAndUnitNumber(request.associationId(), request.unitNumber())) {
            throw new UnitExceptions(
                    "Unit '" + request.unitNumber() + "' already exists in association '" + association.getName() + "'",
                    HttpStatus.CONFLICT);
        }

        boolean isRented = request.occupancyStatus() == OccupancyStatus.RENTED;

        Unit unit = Unit.builder()
                .unitNumber(request.unitNumber())
                .association(association)
                .occupancyStatus(request.occupancyStatus())
                .street(request.street())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .balance(request.balance())
                // Renter fields only stored when RENTED
                .renterFirstName(isRented ? request.renterFirstName() : null)
                .renterLastName(isRented ? request.renterLastName() : null)
                .renterEmail(isRented ? request.renterEmail() : null)
                .renterPhone(isRented ? request.renterPhone() : null)
                .build();

        Unit saved = unitRepository.save(unit);
        associationRepository.increaseTotalUnits(association.getId());
        auditService.log(AuditEvent.CREATE.name(), ENTITY, saved.getId(), userId);
        log.info("Unit created: id={}, associationId={}, tenantId={}", saved.getId(), association.getId(), tenantId);
        return toResponse(saved);
    }

    @Transactional
    public UnitDetailedResponse get(Long id) {
        Unit unit = unitRepository.findUnitWithOwnersById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        requireTenantMatch(unit.getTenantId());
        return toDetailedResponse(unit);
    }

    @Transactional
    public List<UnitResponse> getAllUnitsByAssociationId(Long associationId) {
        return unitRepository
                .findByAssociationIdAndTenantId(associationId, requireTenantId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<UnitResponse> getAllUnitsByTenantId() {
        return unitRepository
                .findByTenantId(requireTenantId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UnitResponse update(Long id, UnitUpdateRequest request, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        requireTenantMatch(unit.getTenantId());

        // Single existence query instead of load + compare
        if (request.unitNumber() != null
                && !request.unitNumber().equals(unit.getUnitNumber())
                && unitRepository.existsByAssociationIdAndUnitNumberAndIdNot(
                unit.getAssociation().getId(), request.unitNumber(), id)) {
            throw new UnitExceptions(
                    "Unit '" + request.unitNumber() + "' already exists in this association",
                    HttpStatus.CONFLICT);
        }

        Optional.ofNullable(request.unitNumber()).ifPresent(unit::setUnitNumber);
        Optional.ofNullable(request.street()).ifPresent(unit::setStreet);
        Optional.ofNullable(request.city()).ifPresent(unit::setCity);
        Optional.ofNullable(request.state()).ifPresent(unit::setState);
        Optional.ofNullable(request.zipCode()).ifPresent(unit::setZipCode);
        Optional.ofNullable(request.balance()).ifPresent(unit::setBalance);

        if (request.occupancyStatus() != null) {
            unit.setOccupancyStatus(request.occupancyStatus());
            if (request.occupancyStatus() != OccupancyStatus.RENTED) {
                unit.clearRenterInfo();   // domain method on entity
            }
        }

        // Only update renter fields if unit is currently RENTED
        if (unit.getOccupancyStatus() == OccupancyStatus.RENTED) {
            Optional.ofNullable(request.renterFirstName()).ifPresent(unit::setRenterFirstName);
            Optional.ofNullable(request.renterLastName()).ifPresent(unit::setRenterLastName);
            Optional.ofNullable(request.renterEmail()).ifPresent(unit::setRenterEmail);
            Optional.ofNullable(request.renterPhone()).ifPresent(unit::setRenterPhone);
        }

        Unit saved = unitRepository.save(unit);
        auditService.log(AuditEvent.UPDATE.name(), ENTITY, id, userId);
        log.info("Unit updated: id={}", id);
        return toResponse(saved);
    }

    @Transactional
    public UnitResponse updateOccupancy(Long id, UpdateOccupancyRequest request, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        requireTenantMatch(unit.getTenantId());

        if (request.occupancyStatus() == unit.getOccupancyStatus()) {
            throw new UnitExceptions("Unit is already set to " + request.occupancyStatus(), HttpStatus.CONFLICT);
        }

        unit.setOccupancyStatus(request.occupancyStatus());
        if (request.occupancyStatus() != OccupancyStatus.RENTED) {
            unit.clearRenterInfo();
        }

        Unit saved = unitRepository.save(unit);
        auditService.log(AuditEvent.OCCUPANCY_UPDATED.name(), ENTITY, id, userId);
        log.info("Unit occupancy updated: id={}, status={}", id, request.occupancyStatus());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        requireTenantMatch(unit.getTenantId());
        Long associationId = unit.getAssociation().getId();
        unitRepository.delete(unit);
        associationRepository.decreaseTotalUnits(associationId);
        auditService.log(AuditEvent.DELETE.name(), ENTITY, id, userId);
        log.info("Unit deleted: id={}, associationId={}", id, associationId);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Long requireTenantId() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new UnitExceptions("Tenant context not found", HttpStatus.BAD_REQUEST);
        }
        return tenantId;
    }

    private void requireTenantMatch(Long resourceTenantId) {
        if (!resourceTenantId.equals(TenantContext.get())) {
            throw new UnitExceptions("You are not authorized to access this unit", HttpStatus.FORBIDDEN);
        }
    }

    private void checkUnitLimit(Long tenantId) {
        if (unitRepository.countByTenantId(tenantId) >= subscriptionService.getUnitLimit(tenantId)) {
            throw new UnitExceptions("Unit limit reached for this subscription", HttpStatus.PAYMENT_REQUIRED);
        }
    }

    private UnitResponse toResponse(Unit unit) {
        List<String> ownerNames = unit.getUnitOwners() == null ? List.of()
                : unit.getUnitOwners().stream()
                .map(uo -> uo.getOwner().getFirstName() + " " + uo.getOwner().getLastName())
                .toList();

        return new UnitResponse(
                unit.getId(),
                unit.getUnitNumber(),
                unit.getTenantId(),
                unit.getAssociation().getId(),
                unit.getStreet(),
                unit.getCity(),
                unit.getState(),
                unit.getZipCode(),
                unit.getOccupancyStatus(),
                unit.getAssociation().getName(),
                unit.getBalance(),
                unit.getCreatedAt(),
                unit.getUpdatedAt(),
                ownerNames,
                unit.getRenterFirstName(),
                unit.getRenterLastName(),
                unit.getRenterEmail(),
                unit.getRenterPhone());
    }

    private UnitDetailedResponse toDetailedResponse(Unit unit) {
        List<OwnerListResponseType> owners = unit.getUnitOwners() == null ? List.of()
                : unit.getUnitOwners().stream()
                .map(uo -> toOwnerSummary(uo.getOwner()))
                .toList();

        return new UnitDetailedResponse(
                unit.getId(),
                unit.getUnitNumber(),
                unit.getTenantId(),
                unit.getAssociation().getId(),
                unit.getStreet(),
                unit.getCity(),
                unit.getState(),
                unit.getZipCode(),
                unit.getOccupancyStatus(),
                unit.getBalance(),
                unit.getAssociation().getName(),
                unit.getUpdatedAt(),
                owners,
                unit.getRenterFirstName(),
                unit.getRenterLastName(),
                unit.getRenterEmail(),
                unit.getRenterPhone());
    }

    private OwnerListResponseType toOwnerSummary(Owner owner) {
        return new OwnerListResponseType(
                owner.getId(),
                owner.getFirstName(),
                owner.getLastName(),
                owner.getEmail(),
                owner.getPhone(),
                owner.getTenantId(),
                owner.getCreatedAt());
    }
}