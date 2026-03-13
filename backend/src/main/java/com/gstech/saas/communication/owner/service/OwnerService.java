package com.gstech.saas.communication.owner.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.CREATE;
import static com.gstech.saas.platform.audit.model.AuditEvent.DELETE;
import static com.gstech.saas.platform.audit.model.AuditEvent.UPDATE;

import java.util.List;
import java.util.Optional;

import com.gstech.saas.communication.owner.dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.owner.model.Owner;
import com.gstech.saas.communication.owner.model.UnitOwner;
import com.gstech.saas.communication.owner.repository.OwnerRepository;
import com.gstech.saas.communication.owner.repository.UnitOwnerRepository;
import com.gstech.saas.communication.unit.model.Unit;
import com.gstech.saas.communication.unit.repository.UnitRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.OwnerExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class OwnerService {
    private static final String ENTITY = "OWNER";
    private final OwnerRepository ownerRepository;
    private final AuditService auditService;
    private final UnitRepository unitRepository;
    private final UnitOwnerRepository unitOwnerRepository;

    @Transactional
    public OwnerListResponseType save(OwnerSaveRequest saveRequest, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new OwnerExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        if (ownerRepository.findByEmail(saveRequest.email()).isPresent()) {
            throw new OwnerExceptions("Owner with this email already exists", HttpStatus.BAD_REQUEST);
        }
        Unit unit = unitRepository.findById(saveRequest.unitId())
                .orElseThrow(() -> new OwnerExceptions("Unit not found", HttpStatus.BAD_REQUEST));
        if (!unit.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to create owner for this unit", HttpStatus.FORBIDDEN);
        }
        if (saveRequest.isBoardMember() && (saveRequest.termStartDate() == null || saveRequest.termEndDate() == null)) {
            throw new OwnerExceptions("Term start date and end date are required for board members",
                    HttpStatus.BAD_REQUEST);
        }
        Owner owner = Owner.builder()
                .tenantId(tenantId)
                .firstName(saveRequest.firstName())
                .lastName(saveRequest.lastName())
                .primaryStreet(saveRequest.primaryStreet())
                .primaryCity(saveRequest.primaryCity())
                .primaryState(saveRequest.primaryState())
                .primaryZip(saveRequest.primaryZip())
                .altStreet(saveRequest.altStreet())
                .altCity(saveRequest.altCity())
                .altState(saveRequest.altState())
                .altZip(saveRequest.altZip())
                .email(saveRequest.email())
                .altEmail(saveRequest.altEmail())
                .phone(saveRequest.phone())
                .altPhone(saveRequest.altPhone())
                .build();

        Owner savedOwner = ownerRepository.save(owner);
        UnitOwner unitOwner = UnitOwner.builder()
                .unit(unit)
                .owner(savedOwner)
                .build();
        if (saveRequest.isBoardMember()) {
            unitOwner.setIsBoardMember(true);
            unitOwner.setTermStartDate(saveRequest.termStartDate());
            unitOwner.setTermEndDate(saveRequest.termEndDate());
        }
        unitOwnerRepository.save(unitOwner);
        auditService.log(CREATE.name(), ENTITY, savedOwner.getId(), userId);
        log.info("Owner created: id={}, tenantId={}", savedOwner.getId(), tenantId);

        return toListResponse(savedOwner);
    }

    public OwnerDetailedResponse get(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new OwnerExceptions("Owner not found", HttpStatus.NOT_FOUND));
        if (!owner.getTenantId().equals(TenantContext.get())) {
            throw new OwnerExceptions("You are not authorized to access this owner", HttpStatus.FORBIDDEN);
        }
        return toDetailedResponse(owner);
    }

    public List<OwnerUnitRowResponse> getOwnersForTable() {
        Long tenantId = TenantContext.get();
        return ownerRepository.findOwnerUnitsByTenant(tenantId);
    }

    public List<OwnerListResponseType> getOwnersByUnit(Long unitId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new OwnerExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        return ownerRepository.findAllByUnitId(unitId).stream().map(this::toListResponse).toList();
    }

    public List<OwnerListResponseType> getBoardMembersByAssociation(Long associationId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new OwnerExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        return ownerRepository.findAllBoardMembersByAssociationId(associationId).stream().map(this::toListResponse)
                .toList();
    }

    public void delete(Long id, Long userId) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new OwnerExceptions("Owner not found", HttpStatus.NOT_FOUND));
        if (!owner.getTenantId().equals(TenantContext.get())) {
            throw new OwnerExceptions("You are not authorized to delete this owner", HttpStatus.FORBIDDEN);
        }
        ownerRepository.deleteById(id);
        auditService.log(DELETE.name(), ENTITY, id, userId);
        log.info("Owner deleted: id={}, tenantId={}", id, TenantContext.get());
    }

    @Transactional
    public OwnerListResponseType update(Long id, OwnerUpdateRequest updateRequest, Long userId) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new OwnerExceptions("Owner not found", HttpStatus.NOT_FOUND));
        if (!owner.getTenantId().equals(TenantContext.get())) {
            throw new OwnerExceptions("You are not authorized to update this owner", HttpStatus.FORBIDDEN);
        }

        Optional.ofNullable(updateRequest.firstName()).ifPresent(owner::setFirstName);
        Optional.ofNullable(updateRequest.lastName()).ifPresent(owner::setLastName);
        Optional.ofNullable(updateRequest.primaryStreet()).ifPresent(owner::setPrimaryStreet);
        Optional.ofNullable(updateRequest.primaryCity()).ifPresent(owner::setPrimaryCity);
        Optional.ofNullable(updateRequest.primaryState()).ifPresent(owner::setPrimaryState);
        Optional.ofNullable(updateRequest.primaryZip()).ifPresent(owner::setPrimaryZip);
        Optional.ofNullable(updateRequest.altStreet()).ifPresent(owner::setAltStreet);
        Optional.ofNullable(updateRequest.altCity()).ifPresent(owner::setAltCity);
        Optional.ofNullable(updateRequest.altState()).ifPresent(owner::setAltState);
        Optional.ofNullable(updateRequest.altZip()).ifPresent(owner::setAltZip);
        Optional.ofNullable(updateRequest.email()).ifPresent(owner::setEmail);
        Optional.ofNullable(updateRequest.altEmail()).ifPresent(owner::setAltEmail);
        Optional.ofNullable(updateRequest.phone()).ifPresent(owner::setPhone);
        Optional.ofNullable(updateRequest.altPhone()).ifPresent(owner::setAltPhone);

        auditService.log(UPDATE.name(), ENTITY, id, userId);
        return toListResponse(ownerRepository.save(owner));
    }

    @Transactional
    public void linkOwnerToUnit(Long ownerId, LinkOwnerRequest linkRequest, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new OwnerExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }

        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new OwnerExceptions("Owner not found", HttpStatus.NOT_FOUND));
        if (!owner.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to access this owner", HttpStatus.FORBIDDEN);
        }

        Unit unit = unitRepository.findById(linkRequest.unitId())
                .orElseThrow(() -> new OwnerExceptions("Unit not found", HttpStatus.BAD_REQUEST));
        if (!unit.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to link owner to this unit", HttpStatus.FORBIDDEN);
        }

        if (unitOwnerRepository.existsByUnitIdAndOwnerId(unit.getId(), owner.getId())) {
            throw new OwnerExceptions("Owner is already linked to this unit", HttpStatus.CONFLICT);
        }

        UnitOwner unitOwner = UnitOwner.builder()
                .unit(unit)
                .owner(owner)
                .isBoardMember(linkRequest.isBoardMember())
                .build();
        unitOwnerRepository.save(unitOwner);

        auditService.log(UPDATE.name(), ENTITY, owner.getId(), userId);
        log.info("Linked owner {} to unit {} by user {}", owner.getId(), unit.getId(), userId);
    }

    @Transactional
    public void updateUnitOwner(Long ownerId, Long unitId, UpdateUnitOwnerRequest updateRequest, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new OwnerExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }

        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new OwnerExceptions("Owner not found", HttpStatus.NOT_FOUND));
        if (!owner.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to access this owner", HttpStatus.FORBIDDEN);
        }

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new OwnerExceptions("Unit not found", HttpStatus.BAD_REQUEST));
        if (!unit.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to access this unit", HttpStatus.FORBIDDEN);
        }

        UnitOwner unitOwner = unitOwnerRepository.findByUnitIdAndOwnerId(unit.getId(), owner.getId())
                .orElseThrow(() -> new OwnerExceptions("Owner is not linked to this unit", HttpStatus.NOT_FOUND));

        if (updateRequest.isBoardMember() != null) {
            unitOwner.setIsBoardMember(updateRequest.isBoardMember());
        }
        Optional.ofNullable(updateRequest.termStartDate()).ifPresent(unitOwner::setTermStartDate);
        Optional.ofNullable(updateRequest.termEndDate()).ifPresent(unitOwner::setTermEndDate);

        if (Boolean.TRUE.equals(unitOwner.getIsBoardMember())
                && (unitOwner.getTermStartDate() == null || unitOwner.getTermEndDate() == null)) {
            throw new OwnerExceptions("Term start date and end date are required for board members",
                    HttpStatus.BAD_REQUEST);
        }

        unitOwnerRepository.save(unitOwner);

        auditService.log(UPDATE.name(), ENTITY, owner.getId(), userId);
        log.info("Updated link for owner {} and unit {} by user {}", owner.getId(), unit.getId(), userId);
    }

    @Transactional
    public void removeOwnerFromUnit(Long ownerId, Long unitId, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new OwnerExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }

        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new OwnerExceptions("Owner not found", HttpStatus.NOT_FOUND));
        if (!owner.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to access this owner", HttpStatus.FORBIDDEN);
        }

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new OwnerExceptions("Unit not found", HttpStatus.BAD_REQUEST));
        if (!unit.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to access this unit", HttpStatus.FORBIDDEN);
        }

        UnitOwner unitOwner = unitOwnerRepository.findByUnitIdAndOwnerId(unit.getId(), owner.getId())
                .orElseThrow(() -> new OwnerExceptions("Owner is not linked to this unit", HttpStatus.NOT_FOUND));

        unitOwnerRepository.delete(unitOwner);

        auditService.log(UPDATE.name(), ENTITY, owner.getId(), userId);
        log.info("Removed link for owner {} and unit {} by user {}", owner.getId(), unit.getId(), userId);
    }

    private OwnerListResponseType toListResponse(Owner owner) {
        // Fetch unit associations with board member info
        List<OwnerListResponseType.UnitAssociationInfo> unitAssociations = unitOwnerRepository
                .findByOwnerId(owner.getId())
                .stream()
                .map(unitOwner -> new OwnerListResponseType.UnitAssociationInfo(
                        unitOwner.getUnit().getUnitNumber(),
                        unitOwner.getUnit().getAssociation().getName(),
                        unitOwner.getIsBoardMember(),
                        unitOwner.getTermStartDate(),
                        unitOwner.getTermEndDate()
                ))
                .toList();

        return new OwnerListResponseType(
                owner.getId(),
                owner.getFirstName(),
                owner.getLastName(),
                owner.getEmail(),
                owner.getPhone(),
                owner.getTenantId(),
                owner.getCreatedAt(),
                unitAssociations);
    }

    private OwnerDetailedResponse toDetailedResponse(Owner owner) {
        // Fetch unit associations with board member info
        List<OwnerDetailedResponse.UnitAssociationInfo> unitAssociations = unitOwnerRepository
                .findByOwnerId(owner.getId())
                .stream()
                .map(unitOwner -> new OwnerDetailedResponse.UnitAssociationInfo(
                        unitOwner.getUnit().getUnitNumber(),
                        unitOwner.getUnit().getAssociation().getName(),
                        unitOwner.getIsBoardMember(),
                        unitOwner.getTermStartDate(),
                        unitOwner.getTermEndDate()
                ))
                .toList();

        return new OwnerDetailedResponse(
                owner.getId(),
                owner.getFirstName(),
                owner.getLastName(),
                owner.getPrimaryStreet(),
                owner.getPrimaryCity(),
                owner.getPrimaryState(),
                owner.getPrimaryZip(),
                owner.getAltStreet(),
                owner.getAltCity(),
                owner.getAltState(),
                owner.getAltZip(),
                owner.getEmail(),
                owner.getAltEmail(),
                owner.getPhone(),
                owner.getAltPhone(),
                owner.getTenantId(),
                owner.getCreatedAt(),
                unitAssociations);
    }
}
