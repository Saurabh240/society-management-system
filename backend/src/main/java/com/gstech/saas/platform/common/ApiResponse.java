package com.gstech.saas.platform.common;

import lombok.Data;

@Data
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String error;
    private String errorCode;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        return r;
    }

    public static ApiResponse<?> error(String code, String message) {
        ApiResponse<?> r = new ApiResponse<>();
        r.success = false;
        r.errorCode = code;
        r.error = message;
        return r;
    }
}

