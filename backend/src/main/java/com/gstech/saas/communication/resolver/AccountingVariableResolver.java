package com.gstech.saas.communication.resolver;

import com.gstech.saas.associations.owner.model.UnitOwner;
import com.gstech.saas.associations.owner.repository.UnitOwnerRepository;
import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Resolves accounting variables per recipient:
 *   {{amount}}, {{balance}}, {{dueDate}}, {{invoiceNumber}}
 *
 * Looks up the unit balance for the delivery's owner. dueDate and
 * invoiceNumber are left blank until invoice-level billing data is available.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountingVariableResolver implements VariableResolver {

    private final UnitOwnerRepository unitOwnerRepository;

    @Override
    public Map<String, String> resolve(Delivery delivery, Message message) {
        Map<String, String> vars = new HashMap<>();
        vars.put("amount", "");
        vars.put("dueDate", "");
        vars.put("balance", "");
        vars.put("invoiceNumber", "");

        if (delivery.getOwnerId() == null) {
            return vars;
        }

        try {
            List<UnitOwner> unitOwners = unitOwnerRepository.findByOwnerId(delivery.getOwnerId());

            // Use the first unit linked to this owner within the message's association
            BigDecimal balance = unitOwners.stream()
                    .filter(uo -> uo.getUnit() != null
                            && (message.getAssociationId() == null
                                || message.getAssociationId().equals(uo.getUnit().getAssociation().getId())))
                    .map(uo -> uo.getUnit().getBalance())
                    .filter(b -> b != null)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);

            String balanceStr = "$" + balance.toPlainString();
            vars.put("balance", balanceStr);
            vars.put("amount", balanceStr);

        } catch (Exception e) {
            log.warn("[AccountingVariableResolver] Failed to resolve balance for ownerId={}: {}",
                    delivery.getOwnerId(), e.getMessage());
        }

        return vars;
    }
}
