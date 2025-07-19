package com.easyvehiclerental.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", message = "Total amount must be non-negative")
    private BigDecimal totalAmount;

    @NotNull(message = "Terms acceptance is required")
    private Boolean termsAccepted;
}