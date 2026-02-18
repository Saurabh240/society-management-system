package com.gstech.saas.communication.community.service;

import com.gstech.saas.communication.community.dtos.CommunitySaveRequest;
import com.gstech.saas.communication.community.model.Community;
import com.gstech.saas.communication.community.repository.CommunityRepository;
import com.gstech.saas.platform.audit.service.AuditService;
import com.gstech.saas.platform.exception.CommunityExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommunityService {
    private String ENTITY ="COMMUNITY";
    private final CommunityRepository communityRepository;
    private final AuditService auditService;
    public Community save(CommunitySaveRequest communitySaveRequest,Long userId){
        Long tenantId = TenantContext.get();
        //yet to be decided
        String status = "PENDING";
        if(tenantId == null){
            throw new CommunityExceptions("Tenant id not found", HttpStatus.BAD_REQUEST);
        }
        //TODO: check if same community exists with same name and tenantID
        if(communityRepository.existsByTenantIdAndName(tenantId,communitySaveRequest.name())){
            throw new CommunityExceptions(
                    "Community with name '" + communitySaveRequest + "' already exists",
                    HttpStatus.CONFLICT
            );
        }
        //TODO: if not exist then create new entity
        Community community = Community.builder()
                .name(communitySaveRequest.name())
                .status(status)
                .tenantId(tenantId)
                .updatedAt(null)
                .build();
        //save to db before audit log so we can save audit log with entity_id
        Community savedCommunity = communityRepository.save(community);
        //TODO: save audit log asynchronized way
        auditService.log("CREATE",ENTITY,savedCommunity.getId(),userId);
        log.info("Community created: id={}, tenantId={}", savedCommunity.getId(), tenantId);
        //returns
        return savedCommunity;
    }

    public Community get(Long id){
        return communityRepository.findById(id)
                .orElseThrow(()->new CommunityExceptions("Community not found",HttpStatus.NOT_FOUND));
    }

    public List<Community> getAllCommunities(){
        Long tenantId = TenantContext.get();
        return communityRepository.findByTenantId(tenantId);
    }
    public void delete(Long id,Long userId){
        communityRepository.deleteById(id);
        auditService.log("DELETE",ENTITY,id,userId);

//        log.info("Community deleted: id={}, tenantId={}", id, community.getTenantId());
    }
    @Transactional
    public Community update(Long id, CommunitySaveRequest communitySaveRequest,Long userId){
        Community community = get(id);
        //check if already existed
        if(communityRepository.existsByTenantIdAndName(community.getTenantId(),communitySaveRequest.name())){
            throw new CommunityExceptions(
                    "Community with name '" + communitySaveRequest.name() + "' already exists",
                    HttpStatus.CONFLICT
            );
        }
        community.setName(communitySaveRequest.name());
        community.setUpdatedAt(Instant.now());
        auditService.log("UPDATE",ENTITY,id,userId);
        return community;
    }
}
