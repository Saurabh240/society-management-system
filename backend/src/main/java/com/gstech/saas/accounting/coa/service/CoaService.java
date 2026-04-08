package com.gstech.saas.accounting.coa.service;

import com.gstech.saas.accounting.coa.dto.CoaRequest;
import com.gstech.saas.accounting.coa.dto.CoaResponse;
import com.gstech.saas.accounting.coa.dto.AccountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CoaService {


    CoaResponse createAccount(CoaRequest request);

    Page<CoaResponse> listAccounts(String search,  AccountType type, Pageable pageable);

    CoaResponse updateAccount(Long id, CoaRequest request);

    void deleteAccount(Long id);
}