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

    private final BankingRepository     bankingRepository;
    private final AssociationRepository associationRepository;

    // ── LIST ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<BankAccountResponse> listAccounts(Long associationId) {
        Long tenantId = TenantContext.get();
        List<Banking> accounts = (associationId != null)
                ? bankingRepository.findByTenantIdAndAssociationId(tenantId, associationId)
                : bankingRepository.findByTenantId(tenantId);
        return accounts.stream().map(this::mapToResponse).toList();
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public BankAccountResponse getAccountById(Long id) {
        return mapToResponse(findOwnedBanking(id));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BankAccountResponse createAccount(BankAccountRequest request) {

        if (request.accountNumber() == null || request.accountNumber().isBlank()) {
            throw new IllegalArgumentException("Account number is required");
        }

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

        return mapToResponse(bankingRepository.save(banking));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    /**
     * Updates a bank account.
     *
     * Account number handling:
     *   - If request.changeAccountNumber() == true AND request.accountNumber() is provided:
     *     re-mask and store the new account number.
     *   - Otherwise: keep the existing masked value unchanged.
     *
     * This prevents the UI from accidentally sending the masked "****XXXX" value
     * back through mask(), which would store "****XXXX" as if it were a real number.
     */
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

        // Only re-mask if the caller explicitly says they're changing the account number
        boolean changingAccountNumber =
                Boolean.TRUE.equals(request.changeAccountNumber())
                        && request.accountNumber() != null
                        && !request.accountNumber().isBlank();

        if (changingAccountNumber) {
            banking.setAccountNumberMasked(mask(request.accountNumber()));
        }
        // else: keep existing banking.accountNumberMasked unchanged

        banking.setAccountNotes(request.accountNotes());
        banking.setCheckPrintingEnabled(request.checkPrintingEnabled() != null
                ? request.checkPrintingEnabled() : false);

        if (request.balance() != null) {
            banking.setBalance(request.balance());
        }

        return mapToResponse(bankingRepository.save(banking));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        bankingRepository.delete(findOwnedBanking(id));
    }

    @Override
    @Transactional
    public void bulkDeleteAccounts(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        ids.forEach(this::deleteAccount);
    }

    // ── BALANCE UPDATE ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BankAccountResponse updateBalance(Long id, BigDecimal balance) {
        if (balance == null) throw new IllegalArgumentException("Balance cannot be null");
        Banking banking = findOwnedBanking(id);
        banking.setBalance(balance);
        return mapToResponse(bankingRepository.save(banking));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private BankAccountResponse mapToResponse(Banking banking) {
        return new BankAccountResponse(
                banking.getId(),
                banking.getAssociationId(),
                banking.getAssociation() != null ? banking.getAssociation().getName() : null,
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
        return bankingRepository
                .findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> BankingExceptions.notFound(id));
    }

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