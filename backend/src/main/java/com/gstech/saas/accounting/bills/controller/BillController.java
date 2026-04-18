package com.gstech.saas.accounting.bills.controller;

import com.gstech.saas.accounting.bills.dto.BillResponse;
import com.gstech.saas.accounting.bills.dto.CreateBillRequest;
import com.gstech.saas.accounting.bills.dto.PayBillRequest;
import com.gstech.saas.accounting.bills.model.BillStatus;
import com.gstech.saas.accounting.bills.service.BillService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/accounting/bills")
@RequiredArgsConstructor
@Tag(name = "Bills", description = "Vendor bill management APIs. Create, update, pay and filter bills.")
public class BillController {

    private final BillService billService;

    /* ===============================
      LIST / FILTER BILLS
      =============================== */
    @Operation(
            summary = "Get / Filter Bills",
            description = "Returns paginated list of bills. Filters supported: associationId, status, issue date range."
    )
    @GetMapping
    public Page<BillResponse> list(
            @Parameter(description = "Filter by Association ID")
            @RequestParam(required = false) Long associationId,

            @Parameter(description = "Filter by Bill Status (UNPAID, PAID, OVERDUE)")
            @RequestParam(required = false) BillStatus status,

            @Parameter(description = "Filter bills issued from this date (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @Parameter(description = "Filter bills issued up to this date (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            Pageable pageable
    ) {
        return billService.list(associationId, status, from, to, pageable);
    }

     /* ===============================
       CREATE BILL
       =============================== */
    @Operation(
            summary = "Create Bill",
            description = "Creates a new vendor bill. Bill number is auto-generated if not provided."
    )
    @PostMapping
    public BillResponse create(@RequestBody CreateBillRequest request) {
        return billService.create(request);
    }

    /* ===============================
      UPDATE BILL
      =============================== */
    @Operation(
            summary = "Update Bill",
            description = "Updates an existing bill. Paid bills cannot be modified."
    )
    @PutMapping("/{id}")
    public BillResponse update( @Parameter(description = "Bill ID", required = true)
                                    @PathVariable Long id,
                               @RequestBody CreateBillRequest request) {
        return billService.update(id, request);
    }

    /* ===============================
      DELETE BILL
      =============================== */
    @Operation(
            summary = "Delete Bill",
            description = "Deletes a bill. Only UNPAID bills can be deleted."
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        billService.delete(id);
    }

    /* ===============================
      PAY BILL
      =============================== */
    @Operation(
            summary = "Pay Bill",
            description = "Marks bill as PAID and automatically creates a Journal Entry in the ledger."
    )
    @PostMapping("/{id}/pay")
    public BillResponse pay(@PathVariable Long id,
                            @RequestBody PayBillRequest request) {
        return billService.pay(id, request);
    }
}
