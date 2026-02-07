package com.gstech.saas.platform.User.controller;

import com.gstech.saas.platform.User.model.LoginRequest;
import com.gstech.saas.platform.User.model.LoginResponse;
import com.gstech.saas.platform.User.model.RegisterRequest;
import com.gstech.saas.platform.User.model.UserResponse;
import com.gstech.saas.platform.User.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest req) {
        return service.register(req);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(service.login(req));
    }
}


