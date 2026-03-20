package com.gstech.saas.associations.owner.service;

import java.util.List;
import java.util.Optional;

import com.gstech.saas.associations.owner.dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.associations.owner.model.Owner;
import com.gstech.saas.associations.owner.model.UnitOwner;
import com.gstech.saas.associations.owner.repository.OwnerRepository;
import com.gstech.saas.associations.owner.repository.UnitOwnerRepository;
import com.gstech.saas.associations.unit.model.Unit;
import com.gstech.saas.associations.unit.repository.UnitRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.OwnerExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import com.gstech.saas.associations.association.repository.AssociationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static com.gstech.saas.platform.audit.model.AuditEvent.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class OwnerService {

    private static final String ENTITY = "OWNER";

    private final OwnerRepository ownerRepository;
    private final UnitOwnerRepository unitOwnerRepository;
    private final UnitRepository unitRepository;
    private final AssociationRepository associationRepository;
    private final AuditService auditService;

    @Transactional
    public OwnerListResponseType save(OwnerSaveRequest request, Long userId) {
        Long tenantId = requireTenantId();

        if (ownerRepository.existsByTenantIdAndEmail(tenantId, request.email())) {
            throw new OwnerExceptions("Owner with this email already exists", HttpStatus.CONFLICT);
        }

        Unit unit = findUnitForTenant(request.unitId(), tenantId);

        // Association must match the unit's association — no extra DB call needed
        if (!unit.getAssociation().getId().equals(request.associationId())) {
            throw new OwnerExceptions("Association ID does not match the unit's association", HttpStatus.BAD_REQUEST);
        }

        Owner owner = Owner.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .altEmail(request.altEmail())
                .phone(request.phone())
                .altPhone(request.altPhone())
                .primaryStreet(request.primaryStreet())
                .primaryCity(request.primaryCity())
                .primaryState(request.primaryState())
                .primaryZip(request.primaryZip())
                .altStreet(request.altStreet())
                .altCity(request.altCity())
                .altState(request.altState())
                .altZip(request.altZip())
                .build();

        Owner savedOwner = ownerRepository.save(owner);

        UnitOwner unitOwner = UnitOwner.builder()
                .unit(unit)
                .owner(savedOwner)
                .isBoardMember(request.isBoardMember())
                .designation(request.isBoardMember() ? request.designation() : null)
                .termStartDate(request.isBoardMember() ? request.termStartDate() : null)
                .termEndDate(request.isBoardMember() ? request.termEndDate() : null)
                .build();

        unitOwner.validateBoardMemberFields();  // domain validation on entity
        unitOwnerRepository.save(unitOwner);

        auditService.log(CREATE.name(), ENTITY, savedOwner.getId(), userId);
        log.info("Owner created: id={}, tenantId={}", savedOwner.getId(), tenantId);
        return toListResponse(savedOwner);
    }

    @Transactional
    public OwnerDetailedResponse get(Long ownerId, Long unitId, Long associationId) {
        Owner owner = findOwnerForTenant(ownerId);

        // Single query fetches the link with unit + association already joined
        UnitOwner unitOwner = unitOwnerRepository
                .findActiveWithUnitAndAssociation(unitId, ownerId)
                .orElseThrow(() -> new OwnerExceptions("Owner is not linked to this unit", HttpStatus.NOT_FOUND));

        if (!unitOwner.getUnit().getAssociation().getId().equals(associationId)) {
            throw new OwnerExceptions("Owner does not belong to this association", HttpStatus.BAD_REQUEST);
        }

        return toDetailedResponse(owner, unitOwner);
    }

    @Transactional
    public List<OwnerUnitRowResponse> getOwnersForTable() {
        return ownerRepository.findOwnerUnitsByTenant(requireTenantId());
    }

    @Transactional
    public List<OwnerListResponseType> getOwnersByUnit(Long unitId) {
        return ownerRepository.findAllByUnitId(unitId)
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    @Transactional
    public List<BoardMemberResponse> getBoardMembersByAssociation(Long associationId) {
        return ownerRepository.findAllBoardMembersByAssociationId(associationId)
                .stream()
                .map(owner -> {
                    // find the relevant unitOwner link for this association
                    UnitOwner unitOwner = owner.getUnitOwners().stream()
                            .filter(uo -> uo.getUnit().getAssociation().getId().equals(associationId)
                                    && uo.isBoardMember()
                                    && uo.isActive())
                            .findFirst()
                            .orElseThrow();
                    return toBoardMemberResponse(owner, unitOwner);
                })
                .toList();
    }

    @Transactional
    public OwnerListResponseType update(Long id, OwnerUpdateRequest request, Long userId) {
        Owner owner = findOwnerForTenant(id);

        // Email uniqueness check only when email is actually being changed
        if (request.email() != null
                && !request.email().equals(owner.getEmail())
                && ownerRepository.existsByTenantIdAndEmailAndIdNot(owner.getTenantId(), request.email(), id)) {
            throw new OwnerExceptions("Email is already in use by another owner", HttpStatus.CONFLICT);
        }

        Optional.ofNullable(request.firstName()).ifPresent(owner::setFirstName);
        Optional.ofNullable(request.lastName()).ifPresent(owner::setLastName);
        Optional.ofNullable(request.email()).ifPresent(owner::setEmail);
        Optional.ofNullable(request.altEmail()).ifPresent(owner::setAltEmail);
        Optional.ofNullable(request.phone()).ifPresent(owner::setPhone);
        Optional.ofNullable(request.altPhone()).ifPresent(owner::setAltPhone);
        Optional.ofNullable(request.primaryStreet()).ifPresent(owner::setPrimaryStreet);
        Optional.ofNullable(request.primaryCity()).ifPresent(owner::setPrimaryCity);
        Optional.ofNullable(request.primaryState()).ifPresent(owner::setPrimaryState);
        Optional.ofNullable(request.primaryZip()).ifPresent(owner::setPrimaryZip);
        Optional.ofNullable(request.altStreet()).ifPresent(owner::setAltStreet);
        Optional.ofNullable(request.altCity()).ifPresent(owner::setAltCity);
        Optional.ofNullable(request.altState()).ifPresent(owner::setAltState);
        Optional.ofNullable(request.altZip()).ifPresent(owner::setAltZip);

        Owner saved = ownerRepository.save(owner);
        auditService.log(UPDATE.name(), ENTITY, id, userId);
        log.info("Owner updated: id={}", id);
        return toListResponse(saved);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Owner owner = findOwnerForTenant(id);
        ownerRepository.delete(owner);  // cascades to unit_owners via orphanRemoval
        auditService.log(DELETE.name(), ENTITY, id, userId);
        log.info("Owner deleted: id={}, tenantId={}", id, owner.getTenantId());
    }

    @Transactional
    public void linkOwnerToUnit(Long ownerId, LinkOwnerRequest request, Long userId) {
        Long tenantId = requireTenantId();
        Owner owner = findOwnerForTenant(ownerId);
        Unit unit = findUnitForTenant(request.unitId(), tenantId);

        if (unitOwnerRepository.existsByUnitIdAndOwnerId(unit.getId(), owner.getId())) {
            throw new OwnerExceptions("Owner is already linked to this unit", HttpStatus.CONFLICT);
        }

        UnitOwner unitOwner = UnitOwner.builder()
                .unit(unit)
                .owner(owner)
                .isBoardMember(request.isBoardMember())
                .designation(request.isBoardMember() ? request.designation() : null)
                .build();

        unitOwner.validateBoardMemberFields();
        unitOwnerRepository.save(unitOwner);

        auditService.log(UNIT_LINKED.name(), ENTITY, owner.getId(), userId);
        log.info("Owner {} linked to unit {} by user {}", owner.getId(), unit.getId(), userId);
    }

    @Transactional
    public void updateUnitOwner(Long ownerId, Long unitId, UpdateUnitOwnerRequest request, Long userId) {
        Long tenantId = requireTenantId();
        findOwnerForTenant(ownerId);          // authorization check
        findUnitForTenant(unitId, tenantId);  // authorization check

        UnitOwner unitOwner = unitOwnerRepository.findByUnitIdAndOwnerId(unitId, ownerId)
                .orElseThrow(() -> new OwnerExceptions("Owner is not linked to this unit", HttpStatus.NOT_FOUND));

        if (request.isBoardMember() != null) {
            if (Boolean.FALSE.equals(request.isBoardMember())) {
                unitOwner.clearBoardMemberInfo();  // domain method clears all fields atomically
            } else {
                unitOwner.setBoardMember(true);
                Optional.ofNullable(request.designation()).ifPresent(unitOwner::setDesignation);
                Optional.ofNullable(request.termStartDate()).ifPresent(unitOwner::setTermStartDate);
                Optional.ofNullable(request.termEndDate()).ifPresent(unitOwner::setTermEndDate);
            }
        } else {
            // Board member status unchanged — only update dates/designation if provided
            Optional.ofNullable(request.designation()).ifPresent(unitOwner::setDesignation);
            Optional.ofNullable(request.termStartDate()).ifPresent(unitOwner::setTermStartDate);
            Optional.ofNullable(request.termEndDate()).ifPresent(unitOwner::setTermEndDate);
        }

        unitOwner.validateBoardMemberFields();  // always validate final state before save
        unitOwnerRepository.save(unitOwner);

        auditService.log(UPDATE.name(), ENTITY, ownerId, userId);
        log.info("UnitOwner updated: ownerId={}, unitId={}", ownerId, unitId);
    }

    @Transactional
    public void removeOwnerFromUnit(Long ownerId, Long unitId, Long userId) {
        Long tenantId = requireTenantId();
        findOwnerForTenant(ownerId);          // authorization check
        findUnitForTenant(unitId, tenantId);  // authorization check

        UnitOwner unitOwner = unitOwnerRepository.findByUnitIdAndOwnerId(unitId, ownerId)
                .orElseThrow(() -> new OwnerExceptions("Owner is not linked to this unit", HttpStatus.NOT_FOUND));

        unitOwnerRepository.delete(unitOwner);
        auditService.log(UNIT_UNLINKED.name(), ENTITY, ownerId, userId);
        log.info("Owner {} removed from unit {} by user {}", ownerId, unitId, userId);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Long requireTenantId() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new OwnerExceptions("Tenant context not found", HttpStatus.BAD_REQUEST);
        }
        return tenantId;
    }

    private Owner findOwnerForTenant(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new OwnerExceptions("Owner not found", HttpStatus.NOT_FOUND));
        if (!owner.getTenantId().equals(TenantContext.get())) {
            throw new OwnerExceptions("You are not authorized to access this owner", HttpStatus.FORBIDDEN);
        }
        return owner;
    }

    private Unit findUnitForTenant(Long unitId, Long tenantId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new OwnerExceptions("Unit not found", HttpStatus.NOT_FOUND));
        if (!unit.getTenantId().equals(tenantId)) {
            throw new OwnerExceptions("You are not authorized to access this unit", HttpStatus.FORBIDDEN);
        }
        return unit;
    }

    private OwnerListResponseType toListResponse(Owner owner) {
        return new OwnerListResponseType(
                owner.getId(),
                owner.getFirstName(),
                owner.getLastName(),
                owner.getEmail(),
                owner.getPhone(),
                owner.getTenantId(),
                null,
                owner.getCreatedAt());
    }

    private OwnerDetailedResponse toDetailedResponse(Owner owner, UnitOwner unitOwner) {
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
                unitOwner.getUnit().getUnitNumber(),
                unitOwner.getUnit().getAssociation().getName(),  // already fetch-joined
                unitOwner.isBoardMember(),
                unitOwner.getDesignation(),
                unitOwner.getTermStartDate(),
                unitOwner.getTermEndDate());
    }

    private BoardMemberResponse toBoardMemberResponse(Owner owner, UnitOwner unitOwner) {
        return new BoardMemberResponse(
                owner.getId(),
                owner.getFirstName(),
                owner.getLastName(),
                owner.getEmail(),
                owner.getPhone(),
                owner.getTenantId(),
                owner.getCreatedAt(),
                unitOwner.getUnit().getId(),
                unitOwner.getUnit().getUnitNumber(),   // now populated
                unitOwner.getDesignation(),
                unitOwner.getTermStartDate(),
                unitOwner.getTermEndDate());
    }
}
