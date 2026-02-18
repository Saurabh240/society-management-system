package com.gstech.saas.communication.community.controller;

import com.gstech.saas.communication.community.dtos.CommunitySaveRequest;
import com.gstech.saas.communication.community.model.Community;
import com.gstech.saas.communication.community.service.CommunityService;
import com.gstech.saas.platform.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor

public class CommunityController {
    private String USER_ID_HEADER_KEY = "x-user-id";
    private final CommunityService communityService;
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ApiResponse<Community> create(@RequestBody @Valid CommunitySaveRequest communitySaveRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID_HEADER_KEY);
        return ApiResponse.success(
                communityService.save(communitySaveRequest,userId)
        );
    }
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}")
    public ApiResponse<Community> update(@PathVariable Long id, @RequestBody @Valid CommunitySaveRequest communitySaveRequest,HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID_HEADER_KEY);
        return ApiResponse.success(
                communityService.update(id, communitySaveRequest,userId)
        );
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ApiResponse<Community> get(@PathVariable @NotNull(message = "id cannot be null") Long id){
        return ApiResponse.success(
                communityService.get(id)
        );
    }
    @GetMapping("/all")
    public ApiResponse<Iterable<Community>> getAll(){
        return ApiResponse.success(
                communityService.getAllCommunities()
        );
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<?> delete(@PathVariable @NotNull(message = "id cannot be null") Long id,HttpServletRequest request){
        Long userId = (Long) request.getAttribute(USER_ID_HEADER_KEY);
        communityService.delete(id,userId);
        return ApiResponse.success(null);
    }

}
