package com.gstech.saas.communication.association.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.CREATE;
import static com.gstech.saas.platform.audit.model.AuditEvent.DELETE;
import static com.gstech.saas.platform.audit.model.AuditEvent.UPDATE;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.association.dtos.AssociationListResponseType;
import com.gstech.saas.communication.association.dtos.AssociationSaveRequest;
import com.gstech.saas.communication.association.dtos.AssociationUpdateRequest;
import com.gstech.saas.communication.association.dtos.AssoicationDetailedResponse;
import com.gstech.saas.communication.association.model.Association;
import com.gstech.saas.communication.association.model.AssociationStatus;
import com.gstech.saas.communication.association.repository.AssociationRepository;
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
    private String ENTITY = "COMMUNITY";
    private final AssociationRepository communityRepository;
    private final AuditService auditService;

    public AssociationListResponseType save(AssociationSaveRequest associationSaveRequest, Long userId) {

        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new AssociationExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        if (communityRepository.existsByTenantIdAndName(tenantId, associationSaveRequest.name())) {
            throw new AssociationExceptions(
                    "Community with name '" + associationSaveRequest.name() + "' already exists",
                    HttpStatus.CONFLICT);
        }
        Association community = Association.builder()
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
        community.setStatus(Optional.ofNullable(associationSaveRequest.status()).orElse(AssociationStatus.ACTIVE));
        // save to db before audit log so we can save audit log with entity_id
        Association savedCommunity = communityRepository.save(community);
        auditService.log(CREATE.name(), ENTITY, savedCommunity.getId(), userId);
        log.info("Community created: id={}, tenantId={}", savedCommunity.getId(), tenantId);
        // returns
        return toResponse(savedCommunity);
    }

    public AssoicationDetailedResponse get(Long id) {
        Association community = communityRepository.findById(id)
                .orElseThrow(() -> new AssociationExceptions("Community not found", HttpStatus.NOT_FOUND));
        if (!community.getTenantId().equals(TenantContext.get())) {
            throw new AssociationExceptions("You are not authorized to get this community", HttpStatus.FORBIDDEN);
        }
        return toDetailedResponse(community);
    }

    public List<AssociationListResponseType> getAllAssociations() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new AssociationExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        List<Association> communities = communityRepository.findByTenantId(tenantId);

        // convert to response dto
        return communities.stream().map(this::toResponse).toList();
    }

    public void delete(Long id, Long userId) {
        Association community = communityRepository.findById(id)
                .orElseThrow(() -> new AssociationExceptions("Community not found", HttpStatus.NOT_FOUND));
        if (!community.getTenantId().equals(TenantContext.get())) {
            throw new AssociationExceptions("You are not authorized to delete this community", HttpStatus.FORBIDDEN);
        }
        communityRepository.deleteById(id);
        auditService.log(DELETE.name(), ENTITY, id, userId);
        log.info("Community deleted: id={}, tenantId={}", id, TenantContext.get());
    }

    @Transactional
    public AssociationListResponseType update(Long id, AssociationUpdateRequest communityUpdateRequest, Long userId) {
        Association community = communityRepository.findById(id)
                .orElseThrow(() -> new AssociationExceptions("Community not found", HttpStatus.NOT_FOUND));
        if (!community.getTenantId().equals(TenantContext.get())) {
            throw new AssociationExceptions("You are not authorized to update this community", HttpStatus.FORBIDDEN);
        }
        // check if already existed
        if (communityRepository.existsByTenantIdAndName(community.getTenantId(), communityUpdateRequest.name())
                && !communityUpdateRequest.name().equals(community.getName())) {
            throw new AssociationExceptions(
                    "Community with name '" + communityUpdateRequest.name() + "' already exists",
                    HttpStatus.CONFLICT);
        }
        Optional.ofNullable(communityUpdateRequest.name()).ifPresent(community::setName);
        Optional.ofNullable(communityUpdateRequest.status()).ifPresent(community::setStatus);
        Optional.ofNullable(communityUpdateRequest.streetAddress()).ifPresent(community::setStreetAddress);
        Optional.ofNullable(communityUpdateRequest.city()).ifPresent(community::setCity);
        Optional.ofNullable(communityUpdateRequest.state()).ifPresent(community::setState);
        Optional.ofNullable(communityUpdateRequest.zipCode()).ifPresent(community::setZipCode);
        Optional.ofNullable(communityUpdateRequest.taxIdentityType()).ifPresent(community::setTaxIdentityType);
        Optional.ofNullable(communityUpdateRequest.taxPayerId()).ifPresent(community::setTaxPayerId);
        community.setUpdatedAt(Instant.now());
        auditService.log(UPDATE.name(), ENTITY, id, userId);
        return toResponse(communityRepository.save(community));
    }

    private AssociationListResponseType toResponse(Association community) {
        return new AssociationListResponseType(
                community.getId(),
                community.getName(),
                community.getStatus(),
                community.getTenantId(),
                community.getTotalUnits(),
                community.getCreatedAt(),
                community.getUpdatedAt());
    }

    private AssoicationDetailedResponse toDetailedResponse(Association community) {
        return new AssoicationDetailedResponse(
                community.getId(),
                community.getName(),
                community.getStatus(),
                community.getStreetAddress(),
                community.getCity(),
                community.getState(),
                community.getZipCode(),
                community.getTaxIdentityType(),
                community.getTaxPayerId(),
                community.getTotalUnits());
    }
}
