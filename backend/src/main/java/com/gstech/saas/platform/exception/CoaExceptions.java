package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatus;

public class CoaExceptions extends RuntimeException {

    private final HttpStatus statusCode;

    public CoaExceptions(HttpStatus statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }

    // ── Static factory helpers ────────────────────────────────────────────────

    /** 409 – account code already exists for this tenant */
    public static CoaExceptions duplicateAccountCode(String accountCode) {
        return new CoaExceptions(
                HttpStatus.CONFLICT,
                "Account code '" + accountCode + "' already exists for this tenant"
        );
    }

    /** 404 – account not found or belongs to a different tenant */
    public static CoaExceptions notFound(Long id) {
        return new CoaExceptions(
                HttpStatus.NOT_FOUND,
                "Chart of account not found with id: " + id
        );
    }
}