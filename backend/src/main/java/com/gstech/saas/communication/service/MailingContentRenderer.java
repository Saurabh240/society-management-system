package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.AssociationAddressDto;
import com.gstech.saas.communication.dto.OwnerDto;
import com.gstech.saas.communication.engine.TemplateEngine;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.resolver.AccountingVariableResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Resolves {{placeholders}} in a mailing for ONE recipient. Used by the PDF generator
 * and by the "View Mailing" screen so both always show identical text.
 */
@Component
@RequiredArgsConstructor
public class MailingContentRenderer {

    private final TemplateEngine templateEngine;
    private final OwnerLookupService ownerLookupService;
    private final AccountingVariableResolver accountingVariableResolver;

    public Map<String, String> variablesFor(Message message, OwnerDto owner) {
        Map<String, String> vars = new HashMap<>();

        String unit = owner.getUnitNumber() != null ? owner.getUnitNumber() : "";
        String email = owner.getEmail() != null ? owner.getEmail() : "";

        vars.put("ownerName", owner.getName());
        vars.put("name", owner.getName());          // legacy alias
        vars.put("unitNumber", unit);
        vars.put("unit", unit);                      // legacy alias
        vars.put("email", email);
        vars.put("ownerEmail", email);

        String street = owner.getStreet() != null ? owner.getStreet() : "";
        String cityLine = Stream.of(owner.getCity(), owner.getState(), owner.getZipCode())
                .filter(s -> s != null && !s.isBlank()).collect(Collectors.joining(", "));
        vars.put("ownerAddress", Stream.of(street, cityLine)
                .filter(s -> !s.isBlank()).collect(Collectors.joining(", ")));

        if (message.getAssociationId() != null) {
            vars.put("associationName", ownerLookupService.getAssociationName(message.getAssociationId()));
            AssociationAddressDto a = ownerLookupService.getAssociationAddressDetails(message.getAssociationId());
            vars.put("associationAddress", Stream.of(a.getStreet(), a.getCity(), a.getState(), a.getZipCode())
                    .filter(s -> s != null && !s.isBlank()).collect(Collectors.joining(", ")));
        }

        vars.put("date", LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy")));
        if (message.getTitle() != null) vars.put("subject", message.getTitle());

        // balance / amount / dueDate / invoiceNumber
        Delivery d = new Delivery();
        d.setOwnerId(owner.getOwnerId());
        vars.putAll(accountingVariableResolver.resolve(d, message));

        return vars;
    }

    public String render(String text, Message message, OwnerDto owner) {
        if (text == null) return "";
        return templateEngine.process(text, variablesFor(message, owner));
    }
}