package com.gstech.saas.communication.resolver;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Resolves accounting variables per recipient:
 *   {{amount}}, {{dueDate}}, {{balance}}, {{invoiceNumber}}
 *
 * TODO: inject BillRepository / LedgerRepository here when the
 *       accounting module has owner-level bill data, then look up
 *       the outstanding balance and due date for delivery.getOwnerId().
 *
 * Until then, these placeholders are left unresolved in the sent email
 * (they will appear literally as {{amount}} etc.) — a deliberate,
 * visible signal that accounting integration is pending.
 */
@Slf4j
@Component
public class AccountingVariableResolver implements VariableResolver {

    @Override
    public Map<String, String> resolve(Delivery delivery, Message message) {
        Map<String, String> vars = new HashMap<>();

        // TODO: replace with real accounting lookup per ownerId
        // Example future implementation:
        //   Bill bill = billRepository.findLatestByOwnerAndAssociation(
        //       delivery.getOwnerId(), message.getAssociationId());
        //   if (bill != null) {
        //       vars.put("amount",        "$" + bill.getAmount());
        //       vars.put("dueDate",       bill.getDueDate().toString());
        //       vars.put("balance",       "$" + bill.getBalance());
        //       vars.put("invoiceNumber", bill.getInvoiceNumber());
        //   }

        log.debug("[AccountingVariableResolver] No accounting data wired yet for ownerId={}",
                delivery.getOwnerId());

        return vars; // empty — placeholders stay intact until accounting is wired
    }
}