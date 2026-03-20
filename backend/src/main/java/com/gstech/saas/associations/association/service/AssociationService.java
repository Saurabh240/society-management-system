package com.gstech.saas.associations.association.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.CREATE;
import static com.gstech.saas.platform.audit.model.AuditEvent.DELETE;
import static com.gstech.saas.platform.audit.model.AuditEvent.UPDATE;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.associations.association.dtos.AssociationDetailedResponse;
import com.gstech.saas.associations.association.dtos.AssociationListResponseType;
import com.gstech.saas.associations.association.dtos.AssociationSaveRequest;
import com.gstech.saas.associations.association.dtos.AssociationUpdateRequest;
import com.gstech.saas.associations.association.model.Association;
import com.gstech.saas.associations.association.model.AssociationStatus;
import com.gstech.saas.associations.association.repository.AssociationRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.AssociationExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AssociationService {

    private static final String ENTITY = "ASSOCIATION";  // static final, not instance field

    private final AssociationRepository associationRepository;
    private final AuditService auditService;

    @Transactional
    public AssociationListResponseType save(AssociationSaveRequest request, Long userId) {
        Long tenantId = requireTenantId();

        if (associationRepository.existsByTenantIdAndName(tenantId, request.name())) {
            throw new AssociationExceptions(
                    "Association with name '" + request.name() + "' already exists",
                    HttpStatus.CONFLICT);
        }

        Association association = Association.builder()
                .name(request.name())
                .streetAddress(request.streetAddress())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .taxIdentityType(request.taxIdentityType())
                .taxPayerId(request.taxPayerId())
                .status(Optional.ofNullable(request.status()).orElse(AssociationStatus.ACTIVE))
                .build();

        Association saved = associationRepository.save(association);
        auditService.log(CREATE.name(), ENTITY, saved.getId(), userId);
        log.info("Association created: id={}, tenantId={}", saved.getId(), tenantId);
        return toListResponse(saved);
    }

    @Transactional
    public AssociationListResponseType update(Long id, AssociationUpdateRequest request, Long userId) {
        Association association = findByIdForTenant(id);

        // Single query replaces the old two-query pattern
        if (request.name() != null &&
                !request.name().equals(association.getName()) &&
                associationRepository.existsByTenantIdAndNameAndIdNot(association.getTenantId(), request.name(), id)) {
            throw new AssociationExceptions(
                    "Association with name '" + request.name() + "' already exists",
                    HttpStatus.CONFLICT);
        }

        Optional.ofNullable(request.name()).ifPresent(association::setName);
        Optional.ofNullable(request.status()).ifPresent(association::setStatus);
        Optional.ofNullable(request.streetAddress()).ifPresent(association::setStreetAddress);
        Optional.ofNullable(request.city()).ifPresent(association::setCity);
        Optional.ofNullable(request.state()).ifPresent(association::setState);
        Optional.ofNullable(request.zipCode()).ifPresent(association::setZipCode);
        Optional.ofNullable(request.taxIdentityType()).ifPresent(association::setTaxIdentityType);
        Optional.ofNullable(request.taxPayerId()).ifPresent(association::setTaxPayerId);
        // updatedAt is handled by @PreUpdate — no need to set manually

        Association saved = associationRepository.save(association);
        auditService.log(UPDATE.name(), ENTITY, id, userId);
        log.info("Association updated: id={}, tenantId={}", id, TenantContext.get());
        return toListResponse(saved);
    }

    @Transactional
    public AssociationDetailedResponse get(Long id) {
        return toDetailedResponse(findByIdForTenant(id));
    }

    @Transactional
    public List<AssociationListResponseType> getAllAssociations() {
        return associationRepository.findByTenantId(requireTenantId())
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Association association = findByIdForTenant(id);
        associationRepository.delete(association);
        auditService.log(DELETE.name(), ENTITY, id, userId);
        log.info("Association deleted: id={}, tenantId={}", id, association.getTenantId());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Association findByIdForTenant(Long id) {
        Association association = associationRepository.findById(id)
                .orElseThrow(() -> new AssociationExceptions("Association not found", HttpStatus.NOT_FOUND));
        if (!association.getTenantId().equals(TenantContext.get())) {
            throw new AssociationExceptions("You are not authorized to access this association", HttpStatus.FORBIDDEN);
        }
        return association;
    }

    private Long requireTenantId() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new AssociationExceptions("Tenant context not found", HttpStatus.BAD_REQUEST);
        }
        return tenantId;
    }

    private AssociationListResponseType toListResponse(Association a) {
        return new AssociationListResponseType(
                a.getId(),
                a.getName(),
                a.getStatus(),
                a.getTenantId(),
                a.getTotalUnits(),
                a.getCreatedAt(),
                a.getUpdatedAt());
    }

    private AssociationDetailedResponse toDetailedResponse(Association a) {
        return new AssociationDetailedResponse(
                a.getId(),
                a.getName(),
                a.getStatus(),
                a.getStreetAddress(),
                a.getCity(),
                a.getState(),
                a.getZipCode(),
                a.getTaxIdentityType(),
                a.getTaxPayerId(),
                a.getTotalUnits());
    }
}
