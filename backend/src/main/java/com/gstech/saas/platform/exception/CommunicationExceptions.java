package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatus;

public class CommunicationExceptions extends RuntimeException {

    private final HttpStatus statusCode;

    public CommunicationExceptions(HttpStatus statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }

    // ── Static factory helpers ────────────────────────────────────────────────

    /** 404 – template not found or belongs to a different tenant */
    public static CommunicationExceptions templateNotFound(Long id) {
        return new CommunicationExceptions(
                HttpStatus.NOT_FOUND,
                "Template not found with id: " + id
        );
    }

    /** 400 – invalid template resolve request */
    public static CommunicationExceptions invalidResolveRequest(String message) {
        return new CommunicationExceptions(
                HttpStatus.BAD_REQUEST,
                message
        );
    }
}
