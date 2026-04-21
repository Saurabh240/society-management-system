package com.gstech.saas.platform.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;

import com.gstech.saas.platform.common.ApiResponse;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        // ── Validation: @Valid on request body ──────────────────────────────────
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {

                String msg = ex.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(e -> e.getField() + ": " + e.getDefaultMessage())
                        .findFirst()
                        .orElse("Validation failed");

                log.warn("Validation error: {}", msg);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("VALIDATION_ERROR", msg));
        }

        // ── Validation: @Validated on path/query params ──────────────────────────
        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ApiResponse<?>> handleConstraintViolation(ConstraintViolationException ex) {

                String msg = ex.getConstraintViolations()
                        .stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .findFirst()
                        .orElse("Constraint violation");

                log.warn("Constraint violation: {}", msg);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("VALIDATION_ERROR", msg));
        }

        // ── Malformed / unreadable JSON body ────────────────────────────────────
        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiResponse<?>> handleUnreadableMessage(HttpMessageNotReadableException ex) {

                log.warn("Malformed request body: {}", ex.getMessage());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("BAD_REQUEST", "Malformed or missing request body"));
        }

        // ── Wrong HTTP method (405) ──────────────────────────────────────────────
        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<ApiResponse<?>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {

                log.warn("Method not supported: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                        .body(ApiResponse.error("METHOD_NOT_ALLOWED", ex.getMessage()));
        }

        // ── No route found (404) ─────────────────────────────────────────────────
        @ExceptionHandler(NoHandlerFoundException.class)
        public ResponseEntity<ApiResponse<?>> handleNoHandler(NoHandlerFoundException ex) {

                log.warn("No handler: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("NOT_FOUND", "Route not found: " + ex.getRequestURL()));
        }

        // ── Missing required query param ─────────────────────────────────────────
        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ApiResponse<?>> handleMissingParam(MissingServletRequestParameterException ex) {

                log.warn("Missing param: {}", ex.getMessage());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("BAD_REQUEST", "Missing parameter: " + ex.getParameterName()));
        }

        // ── Wrong param type (/users/abc when Long expected) ────────────────────
        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiResponse<?>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {

                String msg = String.format("Parameter '%s' should be of type %s",
                        ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

                log.warn("Type mismatch: {}", msg);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("BAD_REQUEST", msg));
        }

        // ── Access Denied (403) ──────────────────────────────────────────────────
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {

                log.warn("Access denied: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("AUTH_ERROR", "Forbidden"));
        }

        // ── Bad Credentials (401) ────────────────────────────────────────────────
        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<?>> handleBadCredentials(BadCredentialsException ex) {

                log.warn("Bad credentials: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("AUTH_ERROR", "Invalid credentials"));
        }

        @ExceptionHandler(CoaExceptions.class)
        public ResponseEntity<ApiResponse<?>> handleCoa(CoaExceptions ex) {
                log.warn("COA error [{}]: {}", ex.getStatusCode(), ex.getMessage());
                return ResponseEntity.status(ex.getStatusCode())
                        .body(ApiResponse.error("COA_ERROR", ex.getMessage()));
        }
        @ExceptionHandler(BankingExceptions.class)
        public ResponseEntity<ApiResponse<?>> handleBanking(BankingExceptions ex) {
                log.warn("Banking error [{}]: {}", ex.getStatusCode(), ex.getMessage());
                return ResponseEntity.status(ex.getStatusCode())
                        .body(ApiResponse.error("BANKING_ERROR", ex.getMessage()));
        }
        @ExceptionHandler(BillAttachmentExceptions.class)
        public ResponseEntity<ApiResponse<?>> handleBillAttachment(BillAttachmentExceptions ex) {
                log.warn("Bill attachment error [{}]: {}", ex.getStatusCode(), ex.getMessage());
                return ResponseEntity.status(ex.getStatusCode())
                        .body(ApiResponse.error("ATTACHMENT_ERROR", ex.getMessage()));
        }

        // IllegalArgumentException covers routing number validation
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<?>> handleIllegalArgument(IllegalArgumentException ex) {
                log.warn("Illegal argument: {}", ex.getMessage());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("BAD_REQUEST", ex.getMessage()));
        }

        // ── ResponseStatusException (404, 409, etc.) ─────────────────────────────
        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ApiResponse<?>> handleResponseStatus(ResponseStatusException ex) {

                // getReason() is cleaner than getMessage() — getMessage() includes the status prefix
                String reason = ex.getReason() != null ? ex.getReason() : ex.getMessage();
                log.warn("ResponseStatusException [{}]: {}", ex.getStatusCode(), reason);
                return ResponseEntity.status(ex.getStatusCode())
                        .body(ApiResponse.error("DATA_ERROR", reason));
        }

        // ── Domain-specific exceptions ───────────────────────────────────────────
        @ExceptionHandler(AssociationExceptions.class)
        public ResponseEntity<ApiResponse<?>> handleAssociation(AssociationExceptions ex) {
                log.warn("Association error [{}]: {}", ex.getStatusCode(), ex.getMessage());
                return ResponseEntity.status(ex.getStatusCode())
                        .body(ApiResponse.error("ASSOCIATION_ERROR", ex.getMessage()));
        }


        @ExceptionHandler(UnitExceptions.class)
        public ResponseEntity<ApiResponse<?>> handleUnit(UnitExceptions ex) {
                log.warn("Unit error [{}]: {}", ex.getStatusCode(), ex.getMessage());
                return ResponseEntity.status(ex.getStatusCode())
                        .body(ApiResponse.error("UNIT_ERROR", ex.getMessage()));
        }

        @ExceptionHandler(OwnerExceptions.class)
        public ResponseEntity<ApiResponse<?>> handleOwner(OwnerExceptions ex) {
                log.warn("Owner error [{}]: {}", ex.getStatusCode(), ex.getMessage());
                return ResponseEntity.status(ex.getStatusCode())
                        .body(ApiResponse.error("OWNER_ERROR", ex.getMessage()));
        }

        // ── Generic fallback (last resort) ───────────────────────────────────────
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<?>> handleGeneric(Exception ex) {

                // log.error prints full stack trace to your log — NOT swallowed
                log.error("Unhandled exception [{}]: {}", ex.getClass().getName(), ex.getMessage(), ex);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("INTERNAL_ERROR",
                                // Expose the real message so Postman shows something useful
                                // Switch this to "Unexpected error" once you go to production
                                ex.getMessage() != null ? ex.getMessage() : "Unexpected error occurred"));
        }
}