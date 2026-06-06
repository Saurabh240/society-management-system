package com.gstech.saas.platform.user.controller;

import com.gstech.saas.platform.common.ApiResponse;
import com.gstech.saas.platform.user.dto.*;
import com.gstech.saas.platform.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management and authentication endpoints")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest req) {
        return service.register(req);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest req,
            HttpServletResponse response) {
        return ResponseEntity.ok(service.login(req, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(service.refresh(refreshToken, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication,
                                       HttpServletRequest httpRequest) {
        service.logout(authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
        service.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    // ── User CRUD ─────────────────────────────────────────────────────────────

    @Operation(summary = "List all users for the current tenant")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(service.listUsers()));
    }

    @Operation(summary = "Invite a new user — sends a temporary password via email")
    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<UserResponse>> invite(
            @RequestBody InviteUserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.invite(req)));
    }

    @Operation(summary = "Update user status (ACTIVE / INACTIVE)")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.updateStatus(id, req)));
    }

    @Operation(summary = "Update user role (TENANT_ADMIN / MANAGER / VIEWER)")
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.updateRole(id, req)));
    }

    @Operation(summary = "Delete a user from the tenant")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Roles ─────────────────────────────────────────────────────────────────

    @Operation(summary = "Get available roles and their user counts for this tenant")
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.success(service.getRoles()));
    }
}