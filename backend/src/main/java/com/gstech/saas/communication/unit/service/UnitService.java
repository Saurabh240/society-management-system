package com.gstech.saas.communication.unit.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.property.repository.PropertyRepository;
import com.gstech.saas.communication.unit.dtos.UnitResponse;
import com.gstech.saas.communication.unit.dtos.UnitSaveRequest;
import com.gstech.saas.communication.unit.dtos.UnitUpdateRequest;
import com.gstech.saas.communication.unit.model.Unit;
import com.gstech.saas.communication.unit.repository.UnitRepository;
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
        if (!propertyRepository.existsById(unitSaveRequest.propertyId())) {
            throw new PropertyExceptions("Property not found", HttpStatus.BAD_REQUEST);
        }
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
        auditService.log("CREATE", ENTITY, savedUnit.getId(), userId);
        log.info("Unit created: id={}, propertyId={}, tenantId={}", savedUnit.getId(), savedUnit.getPropertyId(),
                tenantId);
        return toResponse(savedUnit);
    }

    public UnitResponse get(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
        return toResponse(unit);
    }

    public List<UnitResponse> getAllByPropertyId(Long propertyId) {
        List<Unit> units = unitRepository.findByPropertyId(propertyId);
        return units.stream().map(this::toResponse).toList();
    }

    public List<UnitResponse> getAll() {
        Long tenantId = TenantContext.get();
        List<Unit> units = unitRepository.findAll().stream()
                .filter(u -> tenantId.equals(u.getTenantId()))
                .toList();
        return units.stream().map(this::toResponse).toList();
    }

    public void delete(Long id, Long userId) {
        if (!unitRepository.existsById(id)) {
            throw new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND);
        }
        unitRepository.deleteById(id);
        auditService.log("DELETE", ENTITY, id, userId);
        log.info("Unit deleted: id={}", id);
    }

    @Transactional
    public UnitResponse update(Long id, UnitUpdateRequest unitUpdateRequest, Long userId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitExceptions("Unit not found", HttpStatus.NOT_FOUND));
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
        unit.setUnitNumber(unitUpdateRequest.unitNumber());
        unit.setOccupancyStatus(unitUpdateRequest.occupancyStatus());
        unit.setUpdatedAt(Instant.now());
        auditService.log("UPDATE", ENTITY, id, userId);
        log.info("Unit updated: id={}", id);
        return toResponse(unit);
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
