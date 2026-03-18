package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateMessageRequest;
import com.gstech.saas.communication.service.CommunicationService;
import com.gstech.saas.communication.service.CommunicationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communications")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationServiceImpl service;

    @PostMapping
    public Long send(@RequestBody CreateMessageRequest request){

        return service.send(request);

    }
}
