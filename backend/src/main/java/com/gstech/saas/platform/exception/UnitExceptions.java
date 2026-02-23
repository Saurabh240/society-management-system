package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatusCode;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnitExceptions extends RuntimeException {
    private HttpStatusCode statusCode;

    public UnitExceptions(String message, HttpStatusCode statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
