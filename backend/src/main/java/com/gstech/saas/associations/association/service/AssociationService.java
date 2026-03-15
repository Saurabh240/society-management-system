package com.gstech.saas.associations.association.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.CREATE;
import static com.gstech.saas.platform.audit.model.AuditEvent.DELETE;
import static com.gstech.saas.platform.audit.model.AuditEvent.UPDATE;

import java.time.Instant;
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
    private String ENTITY = "ASSOCIATION";
    private final AssociationRepository associationRepository;
    private final AuditService auditService;

    public AssociationListResponseType save(AssociationSaveRequest associationSaveRequest, Long userId) {

        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new AssociationExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        if (associationRepository.existsByTenantIdAndName(tenantId, associationSaveRequest.name())) {
            throw new AssociationExceptions(
                    "Association with name '" + associationSaveRequest.name() + "' already exists",
                    HttpStatus.CONFLICT);
        }
        Association association = Association.builder()
                .name(associationSaveRequest.name())
                .tenantId(tenantId)
                .streetAddress(associationSaveRequest.streetAddress())
                .city(associationSaveRequest.city())
                .state(associationSaveRequest.state())
                .zipCode(associationSaveRequest.zipCode())
                .taxIdentityType(associationSaveRequest.taxIdentityType())
                .taxPayerId(associationSaveRequest.taxPayerId())
                .build();
        // default setted to active if not provided
        association.setStatus(Optional.ofNullable(associationSaveRequest.status()).orElse(AssociationStatus.ACTIVE));
        // save to db before audit log so we can save audit log with entity_id
        Association savedAssociation = associationRepository.save(association);
        auditService.log(CREATE.name(), ENTITY, savedAssociation.getId(), userId);
        log.info("Association created: id={}, tenantId={}", savedAssociation.getId(), tenantId);
        // returns
        return toResponse(savedAssociation);
    }

    public AssociationDetailedResponse get(Long id) {
        Association association = associationRepository.findById(id)
                .orElseThrow(() -> new AssociationExceptions("Association not found", HttpStatus.NOT_FOUND));
        if (!association.getTenantId().equals(TenantContext.get())) {
            throw new AssociationExceptions("You are not authorized to get this association", HttpStatus.FORBIDDEN);
        }
        return toDetailedResponse(association);
    }

    public List<AssociationListResponseType> getAllAssociations() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new AssociationExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        List<Association> associations = associationRepository.findByTenantId(tenantId);

        // convert to response dto
        return associations.stream().map(this::toResponse).toList();
    }

    public void delete(Long id, Long userId) {
        Association association = associationRepository.findById(id)
                .orElseThrow(() -> new AssociationExceptions("Association not found", HttpStatus.NOT_FOUND));
        if (!association.getTenantId().equals(TenantContext.get())) {
            throw new AssociationExceptions("You are not authorized to delete this association", HttpStatus.FORBIDDEN);
        }
        associationRepository.deleteById(id);
        auditService.log(DELETE.name(), ENTITY, id, userId);
        log.info("Association deleted: id={}, tenantId={}", id, TenantContext.get());
    }

    @Transactional
    public AssociationListResponseType update(Long id, AssociationUpdateRequest associationUpdateRequest, Long userId) {
        Association association = associationRepository.findById(id)
                .orElseThrow(() -> new AssociationExceptions("Association not found", HttpStatus.NOT_FOUND));
        if (!association.getTenantId().equals(TenantContext.get())) {
            throw new AssociationExceptions("You are not authorized to update this association", HttpStatus.FORBIDDEN);
        }
        // check if already existed
        if (associationRepository.existsByTenantIdAndName(association.getTenantId(), associationUpdateRequest.name())
                && !associationUpdateRequest.name().equals(association.getName())) {
            throw new AssociationExceptions(
                    "Association with name '" + associationUpdateRequest.name() + "' already exists",
                    HttpStatus.CONFLICT);
        }
        Optional.ofNullable(associationUpdateRequest.name()).ifPresent(association::setName);
        Optional.ofNullable(associationUpdateRequest.status()).ifPresent(association::setStatus);
        Optional.ofNullable(associationUpdateRequest.streetAddress()).ifPresent(association::setStreetAddress);
        Optional.ofNullable(associationUpdateRequest.city()).ifPresent(association::setCity);
        Optional.ofNullable(associationUpdateRequest.state()).ifPresent(association::setState);
        Optional.ofNullable(associationUpdateRequest.zipCode()).ifPresent(association::setZipCode);
        Optional.ofNullable(associationUpdateRequest.taxIdentityType()).ifPresent(association::setTaxIdentityType);
        Optional.ofNullable(associationUpdateRequest.taxPayerId()).ifPresent(association::setTaxPayerId);
        association.setUpdatedAt(Instant.now());
        auditService.log(UPDATE.name(), ENTITY, id, userId);
        return toResponse(associationRepository.save(association));
    }

    private AssociationListResponseType toResponse(Association association) {
        return new AssociationListResponseType(
                association.getId(),
                association.getName(),
                association.getStatus(),
                association.getTenantId(),
                association.getTotalUnits(),
                association.getCreatedAt(),
                association.getUpdatedAt());
    }

    private AssociationDetailedResponse toDetailedResponse(Association association) {
        return new AssociationDetailedResponse(
                association.getId(),
                association.getName(),
                association.getStatus(),
                association.getStreetAddress(),
                association.getCity(),
                association.getState(),
                association.getZipCode(),
                association.getTaxIdentityType(),
                association.getTaxPayerId(),
                association.getTotalUnits());
    }
}
