package com.gstech.saas.accounting.coa.service;

import com.gstech.saas.accounting.coa.dto.CoaRequest;
import com.gstech.saas.accounting.coa.dto.CoaResponse;
import com.gstech.saas.accounting.coa.dto.AccountType;
import com.gstech.saas.accounting.coa.model.Coa;
import com.gstech.saas.accounting.coa.repository.CoaRepository;
import com.gstech.saas.accounting.coa.service.CoaService;
import com.gstech.saas.platform.exception.CoaExceptions;
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoaServiceImpl implements CoaService {

    private final CoaRepository coaRepository;

    @Override
    @Transactional
    public CoaResponse createAccount(CoaRequest request) {
        Long tenantId = TenantContext.get();

        // Auto-generate account code if blank
        String accountCode = request.accountCode();
        if (!StringUtils.hasText(accountCode)) {
            accountCode = generateNextAccountCode(tenantId);
        } else if (coaRepository.existsByTenantIdAndAccountCodeAndIsDeletedFalse(
                tenantId, accountCode)) {
            throw CoaExceptions.duplicateAccountCode(accountCode);
        }

        Coa coa = Coa.builder()
                .accountCode(accountCode)
                .accountName(request.accountName())
                .accountType(request.accountType())
                .notes(request.notes())
                .build();
        // tenantId is set automatically via BaseEntity.onPrePersist() → TenantContext.get()

        return CoaResponse.from(coaRepository.save(coa));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CoaResponse> listAccounts(String search, AccountType type, Pageable pageable) {

        Long tenantId = TenantContext.get();
        boolean hasSearch = StringUtils.hasText(search);
        boolean hasType   = type != null;
        Page<Coa> page;
        if (hasSearch) {
            page = coaRepository.searchAccounts(tenantId, search, type, pageable);
        } else if (hasType) {
            page = coaRepository
                    .findByTenantIdAndAccountTypeAndIsDeletedFalse(tenantId, type, pageable);
        } else {
            page = coaRepository
                    .findByTenantIdAndIsDeletedFalse(tenantId, pageable);
        }

        return page.map(CoaResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public CoaResponse getAccount(Long id) {
        Long tenantId = TenantContext.get();
        Coa coa = coaRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> CoaExceptions.notFound(id));
        return CoaResponse.from(coa);
    }

    @Override
    @Transactional
    public CoaResponse updateAccount(Long id, CoaRequest request) {
        Long tenantId = TenantContext.get();

        Coa coa = coaRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> CoaExceptions.notFound(id));

        String accountCode = StringUtils.hasText(request.accountCode()) 
                ? request.accountCode() 
                : coa.getAccountCode();
        
        // Only check for duplicates if the code is being changed
        if (!accountCode.equals(coa.getAccountCode()) && 
                coaRepository.existsByTenantIdAndAccountCodeAndIdNotAndIsDeletedFalse(
                        tenantId, accountCode, id)) {
            throw CoaExceptions.duplicateAccountCode(accountCode);
        }

        coa.setAccountCode(accountCode);
        coa.setAccountName(request.accountName());
        coa.setAccountType(request.accountType());
        coa.setNotes(request.notes());

        return CoaResponse.from(coaRepository.save(coa));
    }

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        Long tenantId = TenantContext.get();
        Coa coa = coaRepository.findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
                .orElseThrow(() -> CoaExceptions.notFound(id));
        coa.setIsDeleted(true);
        coaRepository.save(coa);
    }

    @Override
    @Transactional
    public void bulkDeleteAccounts(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        ids.forEach(this::deleteAccount);
    }

    private String generateNextAccountCode(Long tenantId) {
        return coaRepository.findLastAccountCodeForTenant(tenantId)
                .map(lastCoa -> {
                    try {
                        int lastCode = Integer.parseInt(lastCoa.getAccountCode());
                        return String.valueOf(lastCode + 1);
                    } catch (NumberFormatException e) {
                        // If code is not a pure number, append to existing
                        return lastCoa.getAccountCode() + "-1";
                    }
                })
                .orElse("1001");
    }
}