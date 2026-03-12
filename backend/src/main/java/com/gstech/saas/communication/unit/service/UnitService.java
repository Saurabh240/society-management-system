package com.gstech.saas.communication.unit.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.association.model.Association;
import com.gstech.saas.communication.association.repository.AssociationRepository;
import com.gstech.saas.communication.owner.dtos.OwnerListResponseType;
import com.gstech.saas.communication.owner.model.Owner;
import com.gstech.saas.communication.unit.dtos.UnitDetailedResponse;
import com.gstech.saas.communication.unit.dtos.UnitResponse;
import com.gstech.saas.communication.unit.dtos.UnitSaveRequest;
import com.gstech.saas.communication.unit.dtos.UnitUpdateRequest;
import com.gstech.saas.communication.unit.dtos.UpdateOccupancyRequest;
import com.gstech.saas.communication.unit.model.Unit;
import com.gstech.saas.communication.unit.repository.UnitRepository;
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

    private final String ENTITY = "UNIT";
    private final UnitRepository unitRepository;
    private final AssociationRepository associationRepository;
    private final AuditService auditService;
    private final SubscriptionService subscriptionService;

    @Transactional
    public UnitResponse save(UnitSaveRequest unitSaveRequest, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new UnitExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        // check unit limit
        checkUnitLimit(tenantId);
        Association association = associationRepository.findById(unitSaveRequest.associationId())
                .orElseThrow(() -> new UnitExceptions("Association not found", HttpStatus.BAD_REQUEST));
        // check if property belongs to same tenant
        if (!association.getTenantId().equals(tenantId)) {
            throw new UnitExceptions("Property does not belong to same tenant", HttpStatus.BAD_REQUEST);
        }
        // check if unit number already exists in same community
        log.info("Checking if unit number {} already exists in association {}", unitSaveRequest.unitNumber(),
                unitSaveRequest.associationId());
        if (unitRepository
                .findByAssociationIdAndUnitNumber(unitSaveRequest.associationId(), unitSaveRequest.unitNumber())
                .isPresent()) {
            throw new UnitExceptions(
                    "Unit with number '" + unitSaveRequest.unitNumber() + "' already exists in association '"
                            + association.getName() + "'",
                    HttpStatus.CONFLICT);
        }
        Unit unit = Unit.builder()
                .unitNumber(unitSaveRequest.unitNumber())
                .association(association)
                .occupancyStatus(unitSaveRequest.occupancyStatus())
                .state(unitSaveRequest.state())
                .city(unitSaveRequest.city())
                .street(unitSaveRequest.street())
                .zipCode(unitSaveRequest.zipCode())
                .balance(unitSaveRequest.balance())
                .tenantId(tenantId)
                .updatedAt(null)
                .createdAt(Instant.now())
                .build();
        Unit savedUnit = unitRepository.save(unit);
        auditService.log(AuditEvent.CREATE.name(), ENTITY, savedUnit.getId(), userId);
        log.info("Unit created: id={}, associationId={}, tenantId={}", savedUnit.getId(),
                savedUnit.getAssociation().getId(),
                tenantId);
        associationRepository.increaseTotalUnits(unit.getAssociation().getId());
        return toResponse(savedUnit);
    }

    public UnitDetailedResponse get(Long id) {
        Unit unit = unitRepository.findUnitById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        checkTenantAuthorization(unit.getTenantId());
        return toDetailedResponse(unit);
    }

    public List<UnitResponse> getAllUnitsByAssociationId(Long associationId) {
        Long tenantId = TenantContext.get();
        List<Unit> units = unitRepository.findByAssociationIdAndTenantId(associationId, tenantId);
        return units.stream().map(this::toResponse).toList();
    }

    public List<UnitResponse> getAllUnitsByTenantId() {
        Long tenantId = TenantContext.get();
        List<Unit> units = unitRepository.findByTenantId(tenantId);
        log.info("Units found: {}", units);
        return units.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        checkTenantAuthorization(unit.getTenantId());
        unitRepository.delete(unit);
        auditService.log(AuditEvent.DELETE.name(), ENTITY, id, userId);
        associationRepository.decreaseTotalUnits(unit.getAssociation().getId());
        log.info("Unit deleted: id={}", id);
    }

    @Transactional
    public UnitResponse update(Long id, UnitUpdateRequest unitUpdateRequest, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        checkTenantAuthorization(unit.getTenantId());
        // check if unit number already exists in same community
        unitRepository.findByAssociationIdAndUnitNumber(unit.getAssociation().getId(), unitUpdateRequest.unitNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new UnitExceptions(
                                "Unit with number '" + unitUpdateRequest.unitNumber()
                                        + "' already exists in association '" + unit.getAssociation().getId() + "'",
                                HttpStatus.CONFLICT);
                    }
                });
        Optional.ofNullable(unitUpdateRequest.unitNumber()).ifPresent(unit::setUnitNumber);
        Optional.ofNullable(unitUpdateRequest.street()).ifPresent(unit::setStreet);
        Optional.ofNullable(unitUpdateRequest.city()).ifPresent(unit::setCity);
        Optional.ofNullable(unitUpdateRequest.state()).ifPresent(unit::setState);
        Optional.ofNullable(unitUpdateRequest.zipCode()).ifPresent(unit::setZipCode);
        Optional.ofNullable(unitUpdateRequest.occupancyStatus()).ifPresent(unit::setOccupancyStatus);
        Optional.ofNullable(unitUpdateRequest.balance()).ifPresent(unit::setBalance);
        unit.setUpdatedAt(Instant.now());
        auditService.log(AuditEvent.UPDATE.name(), ENTITY, id, userId);
        log.info("Unit updated: id={}", id);
        return toResponse(unitRepository.save(unit));
    }

    public UnitResponse updateOccupancy(Long id, UpdateOccupancyRequest updateOccupancy, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        checkTenantAuthorization(unit.getTenantId());
        // check if occupancy status is valid
        if (updateOccupancy.occupancyStatus().equals(unit.getOccupancyStatus())) {
            throw new UnitExceptions("Occupancy status is already same", HttpStatus.BAD_REQUEST);
        }
        unit.setOccupancyStatus(updateOccupancy.occupancyStatus());
        unit.setUpdatedAt(Instant.now());
        auditService.log(AuditEvent.OCCUPANCY_UPDATED.name(), ENTITY, id, userId);
        log.info("Unit occupancy updated: id={}", id);
        return toResponse(unitRepository.save(unit));
    }

    public void checkTenantAuthorization(Long tenantId) {
        if (!tenantId.equals(TenantContext.get())) {
            throw new UnitExceptions("Unit does not belong to same tenant", HttpStatus.BAD_REQUEST);
        }
    }

    private void checkUnitLimit(Long tenantId) {
        if (unitRepository.countByTenantId(tenantId) >= subscriptionService.getUnitLimit(tenantId)) {
            throw new UnitExceptions("Unit limit reached", HttpStatus.BAD_REQUEST);
        }
    }

    private UnitResponse toResponse(Unit unit) {
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
                unit.getUnitOwners() == null ? null
                        : unit.getUnitOwners().stream().map(owner -> owner.getOwner()).toList());
    }

    private UnitDetailedResponse toDetailedResponse(Unit unit) {
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
                unit.getUnitOwners() == null ? null
                        : unit.getUnitOwners().stream().map(owner -> toOwnerListResponse(owner.getOwner())).toList());
    }

    private OwnerListResponseType toOwnerListResponse(Owner owner) {
        return new OwnerListResponseType(
                owner.getId(),
                owner.getFirstName(),
                owner.getLastName(),
                owner.getEmail(),
                owner.getPhone(),
                owner.getTenantId(),
                owner.getCreatedAt(),
                List.of());
    }
}
