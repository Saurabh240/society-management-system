package com.gstech.saas.communication.resolver;

import com.gstech.saas.associations.owner.model.UnitOwner;
import com.gstech.saas.associations.owner.repository.UnitOwnerRepository;
import com.gstech.saas.associations.vendor.model.Vendor;
import com.gstech.saas.associations.vendor.repository.VendorRepository;
import com.gstech.saas.communication.dto.AssociationAddressDto;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.service.OwnerLookupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Resolves per-recipient variables for email / SMS:
 *   {{ownerName}}, {{unitNumber}}, {{email}}, {{ownerAddress}},
 *   {{associationName}}, {{associationAddress}}, {{date}}, {{subject}}
 *
 * The recipient is identified, in order, by:
 *   1. delivery.ownerId                      (owners picked or broadcast)
 *   2. delivery.vendorId                     (vendor recipients)
 *   3. delivery.email matching an owner      (anything created without an id)
 *   4. delivery.email matching a unit renter (ALL_RESIDENTS renters)
 *
 * If nobody can be identified the placeholders still get a neutral value so a raw
 * "{{ownerName}}" never reaches the recipient's inbox.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OwnerVariableResolver implements VariableResolver {

    private static final String FALLBACK_NAME = "Homeowner";
    private static final String FALLBACK_UNIT = "N/A";

    private final OwnerLookupService ownerLookupService;
    private final UnitOwnerRepository unitOwnerRepository;
    private final VendorRepository vendorRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> resolve(Delivery delivery, Message message) {
        Map<String, String> vars = new HashMap<>();

        Long associationId = message.getAssociationId();
        if (associationId != null) {
            vars.put("associationName", ownerLookupService.getAssociationName(associationId));
            AssociationAddressDto a = ownerLookupService.getAssociationAddressDetails(associationId);
            vars.put("associationAddress", join(a.getStreet(), a.getCity(), a.getState(), a.getZipCode()));
        }
        vars.put("date", LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy")));
        if (message.getSubject() != null) vars.put("subject", message.getSubject());

        String name = null;
        String unit = null;
        final String deliveryEmail = delivery.getEmail();   // effectively final, safe inside lambdas
        String email = deliveryEmail;
        String address = "";

        try {
            List<UnitOwner> links = associationId != null
                    ? unitOwnerRepository.findActiveOwnersByAssociationId(associationId)
                    : List.of();

            // 1. by ownerId
            Optional<UnitOwner> match = Optional.empty();
            if (delivery.getOwnerId() != null) {
                match = links.stream()
                        .filter(uo -> delivery.getOwnerId().equals(uo.getOwner().getId()))
                        .findFirst();
                if (match.isEmpty()) {
                    // owner no longer in this association's active list - still use their record
                    match = unitOwnerRepository.findActiveOwnersByOwnerIds(List.of(delivery.getOwnerId()))
                            .stream().findFirst();
                }
            }

            // 3. by email -> owner
            if (match.isEmpty() && delivery.getVendorId() == null && notBlank(deliveryEmail)) {
                match = links.stream()
                        .filter(uo -> deliveryEmail.equalsIgnoreCase(uo.getOwner().getEmail()))
                        .findFirst();
            }

            if (match.isPresent()) {
                UnitOwner uo = match.get();
                name = fullName(uo.getOwner().getFirstName(), uo.getOwner().getLastName());
                unit = uo.getUnit().getUnitNumber();
                if (!notBlank(email)) email = uo.getOwner().getEmail();
                address = join(uo.getUnit().getStreet(), uo.getUnit().getCity(),
                        uo.getUnit().getState(), uo.getUnit().getZipCode());
            }

            // 2. vendor
            if (name == null && delivery.getVendorId() != null) {
                Optional<Vendor> vendor = vendorRepository.findById(delivery.getVendorId());
                if (vendor.isPresent()) {
                    Vendor v = vendor.get();
                    name = notBlank(v.getCompanyName())
                            ? v.getCompanyName()
                            : fullName(v.getFirstName(), v.getLastName());
                    address = join(v.getStreet(), v.getCity(), v.getState(), v.getZipCode());
                }
            }

            // 4. renter by email
            if (name == null && notBlank(email)) {
                for (UnitOwner uo : links) {
                    if (email.equalsIgnoreCase(uo.getUnit().getRenterEmail())) {
                        name = fullName(uo.getUnit().getRenterFirstName(), uo.getUnit().getRenterLastName());
                        unit = uo.getUnit().getUnitNumber();
                        address = join(uo.getUnit().getStreet(), uo.getUnit().getCity(),
                                uo.getUnit().getState(), uo.getUnit().getZipCode());
                        break;
                    }
                }
            }
        } catch (Exception ex) {
            // never fail a send because a name could not be looked up
            log.warn("[OwnerVariableResolver] lookup failed deliveryId={} messageId={}: {}",
                    delivery.getId(), message.getId(), ex.getMessage());
        }

        if (!notBlank(name)) {
            log.warn("[OwnerVariableResolver] recipient not identified deliveryId={} email={} - using fallback values",
                    delivery.getId(), delivery.getEmail());
        }

        String finalName = notBlank(name) ? name : FALLBACK_NAME;
        String finalUnit = notBlank(unit) ? unit : (delivery.getVendorId() != null ? "" : FALLBACK_UNIT);
        String finalEmail = email != null ? email : "";

        vars.put("ownerName", finalName);
        vars.put("name", finalName);
        vars.put("unitNumber", finalUnit);
        vars.put("unit", finalUnit);
        vars.put("email", finalEmail);
        vars.put("ownerEmail", finalEmail);
        vars.put("ownerAddress", address);
        return vars;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String fullName(String first, String last) {
        return Stream.of(first, last).filter(OwnerVariableResolver::notBlank)
                .collect(Collectors.joining(" ")).trim();
    }

    private static String join(String... parts) {
        return Stream.of(parts).filter(OwnerVariableResolver::notBlank).collect(Collectors.joining(", "));
    }
}
