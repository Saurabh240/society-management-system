package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssociationExceptions extends RuntimeException {
    private HttpStatus statusCode;

    public AssociationExceptions(String message, HttpStatus statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
