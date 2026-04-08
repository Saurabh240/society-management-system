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

@Service
@RequiredArgsConstructor
public class CoaServiceImpl implements CoaService {

    private final CoaRepository coaRepository;

    @Override
    @Transactional
    public CoaResponse createAccount(CoaRequest request) {
        Long tenantId = TenantContext.get();

        if (coaRepository.existsByTenantIdAndAccountCodeAndIsDeletedFalse(
                tenantId, request.accountCode())) {
            throw CoaExceptions.duplicateAccountCode(request.accountCode());
        }

        Coa coa = Coa.builder()
                .accountCode(request.accountCode())
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

        if (hasSearch && hasType) {
            page = coaRepository
                    .findByTenantIdAndAccountNameContainingIgnoreCaseAndAccountTypeAndIsDeletedFalse(
                            tenantId, search, type, pageable);
        } else if (hasSearch) {
            page = coaRepository
                    .findByTenantIdAndAccountNameContainingIgnoreCaseAndIsDeletedFalse(
                            tenantId, search, pageable);
        } else if (hasType) {
            page = coaRepository
                    .findByTenantIdAndAccountTypeAndIsDeletedFalse(tenantId, type, pageable);
        } else {
            page = coaRepository.findByTenantIdAndIsDeletedFalse(tenantId, pageable);
        }

        return page.map(CoaResponse::from);
    }

    @Override
    @Transactional
    public CoaResponse updateAccount(Long id, CoaRequest request) {
        Long tenantId = TenantContext.get();
        Coa coa = findOwnedCoa(tenantId, id);

        if (coaRepository.existsByTenantIdAndAccountCodeAndIdNotAndIsDeletedFalse(
                tenantId, request.accountCode(), id)) {
            throw CoaExceptions.duplicateAccountCode(request.accountCode());
        }

        coa.setAccountCode(request.accountCode());
        coa.setAccountName(request.accountName());
        coa.setAccountType(request.accountType());
        coa.setNotes(request.notes());

        return CoaResponse.from(coaRepository.save(coa));
    }

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        Long tenantId = TenantContext.get();
        Coa coa = findOwnedCoa(tenantId, id);
        coa.setIsDeleted(true);
        coaRepository.save(coa);
    }

    private Coa findOwnedCoa(Long tenantId, Long id) {
        return coaRepository.findById(id)
                .filter(c -> Boolean.FALSE.equals(c.getIsDeleted()))
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> CoaExceptions.notFound(id));
    }
}