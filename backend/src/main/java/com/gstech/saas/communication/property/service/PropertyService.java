package com.gstech.saas.communication.property.service;

import static com.gstech.saas.platform.audit.model.AuditEvent.CREATE;
import static com.gstech.saas.platform.audit.model.AuditEvent.DELETE;
import static com.gstech.saas.platform.audit.model.AuditEvent.UPDATE;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.community.repository.CommunityRepository;
import com.gstech.saas.communication.property.dtos.PropertyResponse;
import com.gstech.saas.communication.property.dtos.PropertySaveRequest;
import com.gstech.saas.communication.property.dtos.PropertyUpdateRequest;
import com.gstech.saas.communication.property.model.Property;
import com.gstech.saas.communication.property.repository.PropertyRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.CommunityExceptions;
import com.gstech.saas.platform.exception.PropertyExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyService {
    private final String ENTITY = "PROPERTY";
    private final PropertyRepository propertyRepository;
    private final CommunityRepository communityRepository;
    private final AuditService auditService;

    public PropertyResponse save(PropertySaveRequest propertySaveRequest, Long userId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new CommunityExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        if (!communityRepository.existsByTenantIdAndId(tenantId, propertySaveRequest.communityId())) {
            throw new CommunityExceptions("Community not found", HttpStatus.BAD_REQUEST);
        }
        if (propertyRepository.existsByTenantIdAndCommunityIdAndName(tenantId, propertySaveRequest.communityId(),
                propertySaveRequest.name())) {
            throw new PropertyExceptions(
                    "Property with name '" + propertySaveRequest.name() + "' already exists in community '"
                            + propertySaveRequest.communityId() + "'",
                    HttpStatus.CONFLICT);
        }
        Property property = Property.builder()
                .name(propertySaveRequest.name())
                .tenantId(tenantId)
                .communityId(propertySaveRequest.communityId())
                .updatedAt(null)
                .createdAt(Instant.now())
                .build();
        // save to db before audit log so we can save audit log with entity_id
        Property savedProperty = propertyRepository.save(property);
        auditService.log(CREATE.name(), ENTITY, savedProperty.getId(), userId);
        log.info("Property created: id={}, tenantId={}", savedProperty.getId(), tenantId);
        // returns
        return toResponse(savedProperty);
    }

    public PropertyResponse get(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyExceptions("Property not found", HttpStatus.NOT_FOUND));
        if (!property.getTenantId().equals(TenantContext.get())) {
            throw new PropertyExceptions("You are not authorized to get this property", HttpStatus.FORBIDDEN);
        }
        return toResponse(property);
    }

    public List<PropertyResponse> getAllProperties() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new CommunityExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        List<Property> properties = propertyRepository.findByTenantId(tenantId);
        return properties.stream().map(this::toResponse).toList();
    }

    public List<PropertyResponse> getAllPropertiesByCommunityId(Long communityId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new CommunityExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        List<Property> properties = propertyRepository.findByTenantIdAndCommunityId(tenantId, communityId);
        return properties.stream().map(this::toResponse).toList();
    }

    public void delete(Long id, Long userId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyExceptions("Property not found", HttpStatus.NOT_FOUND));
        if (!property.getTenantId().equals(TenantContext.get())) {
            throw new PropertyExceptions("You are not authorized to delete this property", HttpStatus.FORBIDDEN);
        }
        propertyRepository.deleteById(id);
        auditService.log(DELETE.name(), ENTITY, id, userId);

        // log.info("Property deleted: id={}, tenantId={}", id,
        // property.getTenantId());
    }

    @Transactional
    public PropertyResponse update(Long id, PropertyUpdateRequest propertyUpdateRequest, Long userId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyExceptions("Property not found", HttpStatus.NOT_FOUND));
        // check if already existed
        if (!property.getTenantId().equals(TenantContext.get())) {
            throw new PropertyExceptions("You are not authorized to update this property", HttpStatus.FORBIDDEN);
        }
        if (propertyRepository.existsByTenantIdAndCommunityIdAndName(property.getTenantId(),
                property.getCommunityId(), propertyUpdateRequest.name())
                && !propertyUpdateRequest.name().equals(property.getName())) {
            throw new PropertyExceptions(
                    "Property with name '" + propertyUpdateRequest.name() + "' already exists in community '"
                            + property.getCommunityId() + "'",
                    HttpStatus.CONFLICT);
        }
        Optional.ofNullable(propertyUpdateRequest.name()).ifPresent(property::setName);
        property.setUpdatedAt(Instant.now());
        auditService.log(UPDATE.name(), ENTITY, id, userId);
        return toResponse(property);
    }

    private PropertyResponse toResponse(Property property) {
        return new PropertyResponse(
                property.getId(),
                property.getName(),
                property.getTenantId(),
                property.getCommunityId(),
                property.getCreatedAt(),
                property.getUpdatedAt());
    }
}
