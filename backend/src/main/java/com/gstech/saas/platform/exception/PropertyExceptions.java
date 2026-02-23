package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PropertyExceptions extends RuntimeException {
    private HttpStatus statusCode;

    public PropertyExceptions(String message, HttpStatus statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
