package com.easyvehiclerental.dto;

import com.easyvehiclerental.entity.Booking;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingDto {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private Booking.BookingStatus status;
    private Boolean termsAccepted;
    private String agreementUrl;
    private LocalDateTime bookingDate;
    private Long vehicleId;
    private String vehicleName;
    private Long userId;
    private String userName;

    public static BookingDto fromEntity(Booking booking) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setStatus(booking.getStatus());
        dto.setTermsAccepted(booking.getTermsAccepted());
        dto.setAgreementUrl(booking.getAgreementUrl());
        dto.setBookingDate(booking.getBookingDate());
        dto.setVehicleId(booking.getVehicle().getId());
        dto.setVehicleName(booking.getVehicle().getName());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getName());
        return dto;
    }
}