package com.gstech.saas.communication.community.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.gstech.saas.communication.community.dtos.CommunityResponse;
import com.gstech.saas.communication.community.dtos.CommunitySaveRequest;
import com.gstech.saas.communication.community.dtos.CommunityUpdateRequest;
import com.gstech.saas.communication.community.model.Community;
import com.gstech.saas.communication.community.repository.CommunityRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.CommunityExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommunityService {
    private String ENTITY = "COMMUNITY";
    private final CommunityRepository communityRepository;
    private final AuditService auditService;

    public CommunityResponse save(CommunitySaveRequest communitySaveRequest, Long userId) {
        Long tenantId = TenantContext.get();
        // yet to be decided
        String status = "PENDING";
        if (tenantId == null) {
            throw new CommunityExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        if (communityRepository.existsByTenantIdAndName(tenantId, communitySaveRequest.name())) {
            throw new CommunityExceptions(
                    "Community with name '" + communitySaveRequest + "' already exists",
                    HttpStatus.CONFLICT);
        }
        Community community = Community.builder()
                .name(communitySaveRequest.name())
                .status(status)
                .tenantId(tenantId)
                .updatedAt(null)
                .build();
        // save to db before audit log so we can save audit log with entity_id
        Community savedCommunity = communityRepository.save(community);
        auditService.log("CREATE", ENTITY, savedCommunity.getId(), userId);
        log.info("Community created: id={}, tenantId={}", savedCommunity.getId(), tenantId);
        // returns
        return toResponse(savedCommunity);
    }

    public CommunityResponse get(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityExceptions("Community not found", HttpStatus.NOT_FOUND));
        return toResponse(community);
    }

    public List<CommunityResponse> getAllCommunities() {
        Long tenantId = TenantContext.get();
        List<Community> communities = communityRepository.findByTenantId(tenantId);

        // convert to response dto
        return communities.stream().map(this::toResponse).toList();
    }

    public void delete(Long id, Long userId) {
        if (!communityRepository.existsById(id)) {
            throw new CommunityExceptions("Community not found", HttpStatus.NOT_FOUND);
        }
        communityRepository.deleteById(id);
        auditService.log("DELETE", ENTITY, id, userId);
        log.info("Community deleted: id={}, tenantId={}", id, TenantContext.get());
    }

    @Transactional
    public CommunityResponse update(Long id, CommunityUpdateRequest communityUpdateRequest, Long userId) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityExceptions("Community not found", HttpStatus.NOT_FOUND));
        // check if already existed
        if (communityRepository.existsByTenantIdAndName(community.getTenantId(), communityUpdateRequest.name())) {
            throw new CommunityExceptions(
                    "Community with name '" + communityUpdateRequest.name() + "' already exists",
                    HttpStatus.CONFLICT);
        }
        community.setName(communityUpdateRequest.name());
        community.setUpdatedAt(Instant.now());
        auditService.log("UPDATE", ENTITY, id, userId);
        return toResponse(community);
    }

    private CommunityResponse toResponse(Community community) {
        return new CommunityResponse(
                community.getId(),
                community.getName(),
                community.getStatus(),
                community.getTenantId(),
                community.getCreatedAt(),
                community.getUpdatedAt());
    }
}
