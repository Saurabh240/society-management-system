package com.gstech.saas.platform.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class CommunityExceptions extends RuntimeException{
    private HttpStatus statusCode;
    public CommunityExceptions(String message,HttpStatus statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}
