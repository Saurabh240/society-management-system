package com.gstech.saas.accounting.banking.service;

import com.gstech.saas.accounting.banking.dto.BankAccountRequest;
import com.gstech.saas.accounting.banking.dto.BankAccountResponse;
import com.gstech.saas.accounting.banking.model.Banking;
import com.gstech.saas.accounting.banking.repository.BankingRepository;
import com.gstech.saas.associations.association.model.Association;
import com.gstech.saas.associations.association.repository.AssociationRepository;
import com.gstech.saas.platform.exception.BankingExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankingServiceImpl implements BankingService {

    private final BankingRepository bankingRepository;
    private final AssociationRepository associationRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // LIST — if associationId is null, return all for tenant
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<BankAccountResponse> listAccounts(Long associationId) {
        Long tenantId = TenantContext.get();

        List<Banking> accounts = bankingRepository
                .findByTenantIdAndOptionalAssociationId(tenantId, associationId);

        return accounts.stream()
                .map(this::mapToResponse)
                .toList();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // GET BY ID
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public BankAccountResponse getAccountById(Long id) {
        return mapToResponse(findOwnedBanking(id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BankAccountResponse createAccount(BankAccountRequest request) {
        validateRoutingNumber(request.routingNumber());
        Association association = associationRepository.findById(request.associationId())
                .orElseThrow(() -> new RuntimeException("Association not found"));

        Banking banking = Banking.builder()
                .associationId(request.associationId())
                .association(association)
                .bankAccountName(request.bankAccountName())
                .accountType(request.accountType())
                .country(request.country() != null ? request.country() : "United States")
                .routingNumber(request.routingNumber())
                .accountNumberMasked(mask(request.accountNumber()))
                .accountNotes(request.accountNotes())
                .checkPrintingEnabled(request.checkPrintingEnabled() != null
                        ? request.checkPrintingEnabled() : false)
                .balance(request.balance() != null ? request.balance() : BigDecimal.ZERO)
                .build();
        // tenantId set automatically via BaseEntity.onPrePersist() → TenantContext.get()

        return mapToResponse(bankingRepository.save(banking));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BankAccountResponse updateAccount(Long id, BankAccountRequest request) {
        Banking banking = findOwnedBanking(id);
        Association association = associationRepository.findById(request.associationId())
                .orElseThrow(() -> new RuntimeException("Association not found"));

        validateRoutingNumber(request.routingNumber());
        banking.setAssociationId(request.associationId());
        banking.setAssociation(association);
        banking.setBankAccountName(request.bankAccountName());
        banking.setAccountType(request.accountType());
        banking.setCountry(request.country() != null ? request.country() : "United States");
        banking.setRoutingNumber(request.routingNumber());
        banking.setAccountNumberMasked(mask(request.accountNumber()));
        banking.setAccountNotes(request.accountNotes());
        banking.setCheckPrintingEnabled(request.checkPrintingEnabled() != null
                ? request.checkPrintingEnabled() : false);
        if (request.balance() != null) {
            banking.setBalance(request.balance());
        }

        return mapToResponse(bankingRepository.save(banking));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        Banking banking = findOwnedBanking(id);
        bankingRepository.delete(banking);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    private BankAccountResponse mapToResponse(Banking banking) {
        return new BankAccountResponse(
                banking.getId(),
                banking.getAssociationId(),
                banking.getAssociation() != null
                        ? banking.getAssociation().getName()
                        : null,   // safe handling
                banking.getBankAccountName(),
                banking.getAccountType(),
                banking.getCountry(),
                banking.getRoutingNumber(),
                banking.getAccountNumberMasked(),
                banking.getAccountNotes(),
                banking.getCheckPrintingEnabled(),
                banking.getBalance(),
                banking.getCreatedAt()
        );
    }

    private Banking findOwnedBanking(Long id) {
        Long tenantId = TenantContext.get();
        return bankingRepository.findById(id)
                .filter(b -> b.getTenantId().equals(tenantId))
                .orElseThrow(() -> BankingExceptions.notFound(id));
    }

    /** Validates routing number is exactly 9 digits — as specified in the doc. */
    private void validateRoutingNumber(String routingNumber) {
        if (!routingNumber.matches("\\d{9}")) {
            throw new IllegalArgumentException("Routing number must be exactly 9 digits");
        }
    }

    /**
     * Masks account number — only "****XXXX" is ever stored.
     * Full number is discarded immediately after this call.
     */
    private String mask(String accountNumber) {
        String last4 = accountNumber.substring(accountNumber.length() - 4);
        return "****" + last4;
    }
}