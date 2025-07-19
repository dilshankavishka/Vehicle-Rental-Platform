package com.easyvehiclerental.controller;

import com.easyvehiclerental.dto.BookingDto;
import com.easyvehiclerental.dto.BookingRequest;
import com.easyvehiclerental.entity.Booking;
import com.easyvehiclerental.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        // In real implementation, get user ID from JWT token
        Long userId = 1L; // Demo user ID
        BookingDto booking = bookingService.createBooking(request, userId);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDto>> getUserBookings(@PathVariable Long userId) {
        List<BookingDto> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<BookingDto>> getOwnerBookings(@PathVariable Long ownerId) {
        List<BookingDto> bookings = bookingService.getOwnerBookings(ownerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        List<BookingDto> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingDto> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        Booking.BookingStatus status = Booking.BookingStatus.valueOf(statusUpdate.get("status"));
        BookingDto booking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        // In real implementation, get user ID from JWT token
        Long userId = 1L; // Demo user ID
        bookingService.cancelBooking(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<BookingDto> completeBooking(
            @PathVariable Long id,
            Authentication authentication) {
        // In real implementation, get user ID from JWT token
        Long userId = 1L; // Demo user ID
        BookingDto booking = bookingService.completeBooking(id, userId);
        return ResponseEntity.ok(booking);
    }
}