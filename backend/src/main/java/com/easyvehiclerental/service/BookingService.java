package com.easyvehiclerental.service;

import com.easyvehiclerental.dto.BookingDto;
import com.easyvehiclerental.dto.BookingRequest;
import com.easyvehiclerental.entity.Booking;
import com.easyvehiclerental.entity.User;
import com.easyvehiclerental.entity.Vehicle;
import com.easyvehiclerental.repository.BookingRepository;
import com.easyvehiclerental.repository.UserRepository;
import com.easyvehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public BookingDto createBooking(BookingRequest request, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        if (!vehicle.getAvailable()) {
            throw new RuntimeException("Vehicle is not available");
        }
        
        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            request.getVehicleId(), request.getStartDate(), request.getEndDate());
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Vehicle is already booked for the selected dates");
        }
        
        Booking booking = new Booking();
        booking.setVehicle(vehicle);
        booking.setUser(user);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalAmount(request.getTotalAmount());
        booking.setTermsAccepted(request.getTermsAccepted());
        booking.setStatus(Booking.BookingStatus.PENDING);
        
        booking = bookingRepository.save(booking);
        return BookingDto.fromEntity(booking);
    }

    public List<BookingDto> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDesc(userId)
            .stream()
            .map(BookingDto::fromEntity)
            .collect(Collectors.toList());
    }

    public List<BookingDto> getOwnerBookings(Long ownerId) {
        return bookingRepository.findByVehicleOwnerIdOrderByBookingDateDesc(ownerId)
            .stream()
            .map(BookingDto::fromEntity)
            .collect(Collectors.toList());
    }

    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAll()
            .stream()
            .map(BookingDto::fromEntity)
            .collect(Collectors.toList());
    }

    public BookingDto updateBookingStatus(Long bookingId, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        booking = bookingRepository.save(booking);
        
        return BookingDto.fromEntity(booking);
    }

    public void cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.ACTIVE || 
            booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel active or completed booking");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public BookingDto completeBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to complete this booking");
        }
        
        if (booking.getStatus() != Booking.BookingStatus.ACTIVE && 
            booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Can only complete active or confirmed bookings");
        }
        
        // Check if end date is today or in the past
        if (booking.getEndDate().isAfter(java.time.LocalDate.now())) {
            throw new RuntimeException("Cannot complete booking before end date");
        }
        
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking = bookingRepository.save(booking);
        
        return BookingDto.fromEntity(booking);
    }
}