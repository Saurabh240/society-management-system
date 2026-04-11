package com.gstech.saas.accounting.banking.service;

import com.gstech.saas.accounting.banking.dto.BankAccountRequest;
import com.gstech.saas.accounting.banking.dto.BankAccountResponse;
import com.gstech.saas.accounting.banking.model.Banking;
import com.gstech.saas.accounting.banking.repository.BankingRepository;
import com.gstech.saas.associations.association.repository.AssociationRepository;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankingService {

    private final BankingRepository bankingRepository;
    private final AssociationRepository associationRepository;

    // ── LIST ──────────────────────────────────────────────────────────────────

    public List<BankAccountResponse> listBankAccounts(Long associationId) {
        Long tenantId = TenantContext.get();

        List<Banking> accounts = (associationId != null)
                ? bankingRepository.findByTenantIdAndAssociationIdOrderByCreatedAtDesc(tenantId, associationId)
                : bankingRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);

        return accounts.stream().map(this::toResponse).toList();
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Transactional
    public BankAccountResponse createBankAccount(BankAccountRequest request) {
        // Full account number is masked here — only last 4 digits stored
        String masked = maskAccountNumber(request.accountNumber());

        Banking banking = Banking.builder()
                .associationId(request.associationId())
                .bankAccountName(request.bankAccountName())
                .accountType(request.accountType())
                .country(Optional.ofNullable(request.country())
                        .filter(c -> !c.isBlank())
                        .orElse("United States"))
                .routingNumber(request.routingNumber())
                .accountNumberMasked(masked)
                .accountNotes(request.accountNotes())
                .checkPrintingEnabled(request.checkPrintingEnabled() != null
                        && request.checkPrintingEnabled())
                .balance(Optional.ofNullable(request.balance()).orElse(BigDecimal.ZERO))
                .build();
        // BaseEntity @PrePersist sets tenantId automatically

        Banking saved = bankingRepository.save(banking);
        log.info("[Banking] Created id={} tenantId={}", saved.getId(), saved.getTenantId());
        return toResponse(saved);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Transactional
    public BankAccountResponse updateBankAccount(Long id, BankAccountRequest request) {
        Banking banking = findForTenant(id);

        banking.setBankAccountName(request.bankAccountName());
        banking.setAccountType(request.accountType());
        banking.setAssociationId(request.associationId());

        if (request.country() != null && !request.country().isBlank()) {
            banking.setCountry(request.country());
        }
        // Only update routing number if provided
        if (request.routingNumber() != null && !request.routingNumber().isBlank()) {
            banking.setRoutingNumber(request.routingNumber());
        }
        // Only update account number mask if a new account number is sent
        if (request.accountNumber() != null && !request.accountNumber().isBlank()) {
            banking.setAccountNumberMasked(maskAccountNumber(request.accountNumber()));
        }
        if (request.accountNotes() != null) {
            banking.setAccountNotes(request.accountNotes());
        }
        if (request.checkPrintingEnabled() != null) {
            banking.setCheckPrintingEnabled(request.checkPrintingEnabled());
        }
        if (request.balance() != null) {
            banking.setBalance(request.balance());
        }

        Banking saved = bankingRepository.save(banking);
        log.info("[Banking] Updated id={}", id);
        return toResponse(saved);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteBankAccount(Long id) {
        Banking banking = findForTenant(id);
        bankingRepository.delete(banking);
        log.info("[Banking] Deleted id={}", id);
    }

    // ── BALANCE PATCH ─────────────────────────────────────────────────────────

    @Transactional
    public BankAccountResponse updateBalance(Long id, BigDecimal balance) {
        Banking banking = findForTenant(id);
        banking.setBalance(balance);
        return toResponse(bankingRepository.save(banking));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Banking findForTenant(Long id) {
        return bankingRepository.findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bank account not found with id=" + id));
    }

    /**
     * Masks all but the last 4 digits of an account number.
     * "123456789" → "****6789"
     */
    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return "****";
        }
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }

    private BankAccountResponse toResponse(Banking b) {
        // Look up association name for display — avoids frontend needing a separate call
        String associationName = associationRepository.findById(b.getAssociationId())
                .map(a -> a.getName())
                .orElse("Unknown");

        return new BankAccountResponse(
                b.getId(),
                b.getAssociationId(),
                associationName,
                b.getBankAccountName(),
                b.getAccountType(),
                b.getCountry(),
                b.getRoutingNumber(),
                b.getAccountNumberMasked(),
                b.getAccountNotes(),
                b.getCheckPrintingEnabled(),
                b.getBalance(),
                b.getCreatedAt()
        );
    }
}
