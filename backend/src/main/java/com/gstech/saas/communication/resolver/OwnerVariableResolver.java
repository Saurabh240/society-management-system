package com.gstech.saas.communication.resolver;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.service.OwnerLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Resolves per-recipient owner variables:
 *   {{ownerName}}, {{unitNumber}}, {{email}}, {{associationName}}
 */
@Component
@RequiredArgsConstructor
public class OwnerVariableResolver implements VariableResolver {

    private final OwnerLookupService ownerLookupService;

    @Override
    public Map<String, String> resolve(Delivery delivery, Message message) {
        Map<String, String> vars = new HashMap<>();

        // Association-level — always resolvable
        if (message.getAssociationId() != null) {
            vars.put("associationName",
                    ownerLookupService.getAssociationName(message.getAssociationId()));
        }

        // Per-owner — only when ownerId is set on the delivery
        if (delivery.getOwnerId() != null && message.getAssociationId() != null) {
            ownerLookupService
                    .findOwnersByAssociation(message.getAssociationId())
                    .stream()
                    .filter(o -> o.getOwnerId().equals(delivery.getOwnerId()))
                    .findFirst()
                    .ifPresent(owner -> {
                        vars.put("ownerName",   owner.getName());
                        vars.put("unitNumber",  owner.getUnitNumber());
                        vars.put("email",       owner.getEmail() != null ? owner.getEmail() : "");
                    });
        }

        return vars;
    }
}