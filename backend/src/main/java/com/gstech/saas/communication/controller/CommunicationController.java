package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateEmailRequest;
import com.gstech.saas.communication.service.CommunicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communications")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    @PostMapping("/emails")
    public Long createEmail(
             @RequestBody CreateEmailRequest request){

        return communicationService.createEmail(request);

    }

    @PostMapping("/emails/{id}/send")
    public void sendEmail(@PathVariable Long id){

        communicationService.sendNow(id);

    }

}
