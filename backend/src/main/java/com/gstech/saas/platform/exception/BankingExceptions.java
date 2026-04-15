package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatus;

public class BankingExceptions extends RuntimeException {

    private final HttpStatus statusCode;

    public BankingExceptions(HttpStatus statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }
    public HttpStatus getStatusCode() {
        return statusCode;
    }
    public static BankingExceptions notFound(Long id) {
        return new BankingExceptions(
                HttpStatus.NOT_FOUND,
                "Bank account not found with id: " + id
        );
    }
}