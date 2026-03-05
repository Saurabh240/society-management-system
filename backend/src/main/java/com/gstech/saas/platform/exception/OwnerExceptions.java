package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OwnerExceptions extends RuntimeException {
    private HttpStatus statusCode;

    public OwnerExceptions(String message, HttpStatus statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
