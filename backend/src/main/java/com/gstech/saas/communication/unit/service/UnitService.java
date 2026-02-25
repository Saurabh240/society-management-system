package com.gstech.saas.communication.unit.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.community.model.Community;
import com.gstech.saas.communication.community.repository.CommunityRepository;
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
    private final CommunityRepository communityRepository;
    private final AuditService auditService;
    private final SubscriptionService subscriptionService;

    public UnitResponse save(UnitSaveRequest unitSaveRequest, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new UnitExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        // check unit limit
        checkUnitLimit(tenantId);
        Community community = communityRepository.findById(unitSaveRequest.communityId())
                .orElseThrow(() -> new UnitExceptions("Community not found", HttpStatus.BAD_REQUEST));
        // check if property belongs to same tenant
        if (!community.getTenantId().equals(tenantId)) {
            throw new UnitExceptions("Property does not belong to same tenant", HttpStatus.BAD_REQUEST);
        }
        // check if unit number already exists in same community
        if (unitRepository.findByCommunityIdAndUnitNumber(unitSaveRequest.communityId(), unitSaveRequest.unitNumber())
                .isPresent()) {
            throw new UnitExceptions(
                    "Unit with number '" + unitSaveRequest.unitNumber() + "' already exists in community '"
                            + community.getName() + "'",
                    HttpStatus.CONFLICT);
        }
        Unit unit = Unit.builder()
                .unitNumber(unitSaveRequest.unitNumber())
                .communityId(unitSaveRequest.communityId())
                .occupancyStatus(unitSaveRequest.occupancyStatus())
                .state(unitSaveRequest.state())
                .city(unitSaveRequest.city())
                .street(unitSaveRequest.street())
                .zipCode(unitSaveRequest.zipCode())
                .tenantId(tenantId)
                .updatedAt(null)
                .createdAt(Instant.now())
                .build();
        Unit savedUnit = unitRepository.save(unit);
        auditService.log(AuditEvent.CREATE.name(), ENTITY, savedUnit.getId(), userId);
        log.info("Unit created: id={}, communityId={}, tenantId={}", savedUnit.getId(), savedUnit.getCommunityId(),
                tenantId);
        return toResponse(savedUnit);
    }

    public UnitResponse get(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        checkTenantAuthorization(unit.getTenantId());
        return toResponse(unit);
    }

    public List<UnitResponse> getAllUnitsByCommunityId(Long communityId) {
        Long tenantId = TenantContext.get();
        List<Unit> units = unitRepository.findByCommunityIdAndTenantId(communityId, tenantId);
        return units.stream().map(this::toResponse).toList();
    }

    public List<UnitResponse> getAllUnitsByTenantId() {
        Long tenantId = TenantContext.get();
        List<Unit> units = unitRepository.findByTenantId(tenantId);
        return units.stream().map(this::toResponse).toList();
    }

    public void delete(Long id, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        checkTenantAuthorization(unit.getTenantId());
        unitRepository.delete(unit);
        auditService.log(AuditEvent.DELETE.name(), ENTITY, id, userId);
        log.info("Unit deleted: id={}", id);
    }

    @Transactional
    public UnitResponse update(Long id, UnitUpdateRequest unitUpdateRequest, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        checkTenantAuthorization(unit.getTenantId());
        // check if unit number already exists in same community
        unitRepository.findByCommunityIdAndUnitNumber(unit.getCommunityId(), unitUpdateRequest.unitNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new UnitExceptions(
                                "Unit with number '" + unitUpdateRequest.unitNumber()
                                        + "' already exists in community '" + unit.getCommunityId() + "'",
                                HttpStatus.CONFLICT);
                    }
                });
        Optional.ofNullable(unitUpdateRequest.unitNumber()).ifPresent(unit::setUnitNumber);
        Optional.ofNullable(unitUpdateRequest.street()).ifPresent(unit::setStreet);
        Optional.ofNullable(unitUpdateRequest.city()).ifPresent(unit::setCity);
        Optional.ofNullable(unitUpdateRequest.state()).ifPresent(unit::setState);
        Optional.ofNullable(unitUpdateRequest.zipCode()).ifPresent(unit::setZipCode);
        Optional.ofNullable(unitUpdateRequest.occupancyStatus()).ifPresent(unit::setOccupancyStatus);
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
                unit.getCommunityId(),
                unit.getStreet(),
                unit.getCity(),
                unit.getState(),
                unit.getZipCode(),
                unit.getOccupancyStatus(),
                unit.getCreatedAt(),
                unit.getUpdatedAt());
    }
}
