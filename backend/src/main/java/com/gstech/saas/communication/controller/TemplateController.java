package com.gstech.saas.communication.controller;

import com.gstech.saas.communication.dto.CreateTemplateRequest;
import com.gstech.saas.communication.dto.TemplateResponse;
import com.gstech.saas.communication.dto.UpdateTemplateRequest;
import com.gstech.saas.communication.service.CommunicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communications/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final CommunicationService communicationService;

    @GetMapping
    public List<TemplateResponse> listTemplates(
            @RequestParam(required = false) String level) {

        return communicationService.getTemplates(level);
    }

    @PostMapping
    public TemplateResponse createTemplate(
            @RequestBody CreateTemplateRequest request) {

        return communicationService.createTemplate(request);
    }

    @PutMapping("/{id}")
    public TemplateResponse updateTemplate(
            @PathVariable Long id,
            @RequestBody UpdateTemplateRequest request) {

        return communicationService.updateTemplate(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable Long id) {

        communicationService.deleteTemplate(id);
    }
}
