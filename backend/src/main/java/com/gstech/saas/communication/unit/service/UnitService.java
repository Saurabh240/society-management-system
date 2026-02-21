package com.gstech.saas.communication.unit.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.property.model.Property;
import com.gstech.saas.communication.property.repository.PropertyRepository;
import com.gstech.saas.communication.unit.dtos.UnitResponse;
import com.gstech.saas.communication.unit.dtos.UnitSaveRequest;
import com.gstech.saas.communication.unit.dtos.UnitUpdateRequest;
import com.gstech.saas.communication.unit.model.Unit;
import com.gstech.saas.communication.unit.repository.UnitRepository;
import com.gstech.saas.platform.audit.model.AuditEvent;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.PropertyExceptions;
import com.gstech.saas.platform.exception.UnitExceptions;
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
    private final PropertyRepository propertyRepository;
    private final AuditService auditService;

    public UnitResponse save(UnitSaveRequest unitSaveRequest, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new UnitExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        Property property = propertyRepository.findById(unitSaveRequest.propertyId())
                .orElseThrow(() -> new PropertyExceptions("Property not found", HttpStatus.BAD_REQUEST));
        // check if property belongs to same tenant
        if (!property.getTenantId().equals(tenantId)) {
            throw new PropertyExceptions("Property does not belong to same tenant", HttpStatus.BAD_REQUEST);
        }
        // check if unit number already exists in same property
        if (unitRepository.findByPropertyIdAndUnitNumber(unitSaveRequest.propertyId(), unitSaveRequest.unitNumber())
                .isPresent()) {
            throw new UnitExceptions(
                    "Unit with number '" + unitSaveRequest.unitNumber() + "' already exists in property '"
                            + unitSaveRequest.propertyId() + "'",
                    HttpStatus.CONFLICT);
        }
        Unit unit = Unit.builder()
                .unitNumber(unitSaveRequest.unitNumber())
                .propertyId(unitSaveRequest.propertyId())
                .occupancyStatus(unitSaveRequest.occupancyStatus())
                .tenantId(tenantId)
                .updatedAt(null)
                .createdAt(Instant.now())
                .build();
        Unit savedUnit = unitRepository.save(unit);
        auditService.log(AuditEvent.CREATE.name(), ENTITY, savedUnit.getId(), userId);
        log.info("Unit created: id={}, propertyId={}, tenantId={}", savedUnit.getId(), savedUnit.getPropertyId(),
                tenantId);
        return toResponse(savedUnit);
    }

    public UnitResponse get(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        Long tenantId = TenantContext.get();
        if (!unit.getTenantId().equals(tenantId)) {
            throw new UnitExceptions("Unit does not belong to same tenant", HttpStatus.BAD_REQUEST);
        }
        return toResponse(unit);
    }

    public List<UnitResponse> getAllUnitsByPropertyId(Long propertyId) {
        Long tenantId = TenantContext.get();
        List<Unit> units = unitRepository.findByPropertyIdAndTenantId(propertyId, tenantId);
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
        Long tenantId = TenantContext.get();
        if (!unit.getTenantId().equals(tenantId)) {
            throw new UnitExceptions("Unit does not belong to same tenant", HttpStatus.BAD_REQUEST);
        }
        unitRepository.delete(unit);
        auditService.log(AuditEvent.DELETE.name(), ENTITY, id, userId);
        log.info("Unit deleted: id={}", id);
    }

    @Transactional
    public UnitResponse update(Long id, UnitUpdateRequest unitUpdateRequest, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        Long tenantId = TenantContext.get();
        if (!unit.getTenantId().equals(tenantId)) {
            throw new UnitExceptions("Unit does not belong to same tenant", HttpStatus.BAD_REQUEST);
        }
        // check if unit number already exists in same property
        unitRepository.findByPropertyIdAndUnitNumber(unit.getPropertyId(), unitUpdateRequest.unitNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new UnitExceptions(
                                "Unit with number '" + unitUpdateRequest.unitNumber()
                                        + "' already exists in property '" + unit.getPropertyId() + "'",
                                HttpStatus.CONFLICT);
                    }
                });
        Optional.ofNullable(unitUpdateRequest.unitNumber()).ifPresent(unit::setUnitNumber);
        Optional.ofNullable(unitUpdateRequest.occupancyStatus()).ifPresent(unit::setOccupancyStatus);
        unit.setUpdatedAt(Instant.now());
        auditService.log(AuditEvent.UPDATE.name(), ENTITY, id, userId);
        log.info("Unit updated: id={}", id);
        return toResponse(unitRepository.save(unit));
    }

    private UnitResponse toResponse(Unit unit) {
        return new UnitResponse(
                unit.getId(),
                unit.getUnitNumber(),
                unit.getPropertyId(),
                unit.getTenantId(),
                unit.getOccupancyStatus(),
                unit.getCreatedAt(),
                unit.getUpdatedAt());
    }
}
