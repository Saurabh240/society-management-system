package com.gstech.saas.accounting.banking.service;

import com.gstech.saas.accounting.banking.dto.BankAccountRequest;
import com.gstech.saas.accounting.banking.dto.BankAccountResponse;

import java.math.BigDecimal;
import java.util.List;

public interface BankingService {

    List<BankAccountResponse> listAccounts(Long associationId);

    BankAccountResponse getAccountById(Long id);

    BankAccountResponse createAccount(BankAccountRequest request);

    BankAccountResponse updateAccount(Long id, BankAccountRequest request);

    void deleteAccount(Long id);

    BankAccountResponse updateBalance(Long id, BigDecimal balance);
}