package com.easyvehiclerental.service;

import com.easyvehiclerental.dto.ReviewDto;
import com.easyvehiclerental.dto.ReviewRequest;
import com.easyvehiclerental.entity.Booking;
import com.easyvehiclerental.entity.Review;
import com.easyvehiclerental.entity.User;
import com.easyvehiclerental.entity.Vehicle;
import com.easyvehiclerental.repository.BookingRepository;
import com.easyvehiclerental.repository.ReviewRepository;
import com.easyvehiclerental.repository.UserRepository;
import com.easyvehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public List<ReviewDto> getVehicleReviews(Long vehicleId) {
        return reviewRepository.findByVehicleIdOrderByCreatedDateDesc(vehicleId)
            .stream()
            .map(ReviewDto::fromEntity)
            .collect(Collectors.toList());
    }

    public List<ReviewDto> getUserReviews(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedDateDesc(userId)
            .stream()
            .map(ReviewDto::fromEntity)
            .collect(Collectors.toList());
    }

    public List<ReviewDto> getOwnerReviews(Long ownerId) {
        return reviewRepository.findByVehicleOwnerIdOrderByCreatedDateDesc(ownerId)
            .stream()
            .map(ReviewDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto createReview(ReviewRequest request, Long userId) {
        // Validate booking exists and is completed
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getStatus().equals(Booking.BookingStatus.COMPLETED)) {
            throw new RuntimeException("Can only review completed bookings");
        }
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Can only review your own bookings");
        }
        
        // Check if review already exists
        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new RuntimeException("Review already exists for this booking");
        }
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = new Review();
        review.setVehicle(vehicle);
        review.setUser(user);
        review.setBooking(booking);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        review = reviewRepository.save(review);
        
        // Update vehicle rating
        updateVehicleRating(vehicle.getId());
        
        return ReviewDto.fromEntity(review);
    }

    public boolean reviewExistsForBooking(Long bookingId) {
        return reviewRepository.existsByBookingId(bookingId);
    }

    private void updateVehicleRating(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        BigDecimal averageRating = reviewRepository.getAverageRatingByVehicleId(vehicleId);
        long reviewCount = reviewRepository.getReviewCountByVehicleId(vehicleId);
        
        vehicle.setRating(averageRating != null ? averageRating : BigDecimal.ZERO);
        vehicle.setReviewCount((int) reviewCount);
        
        vehicleRepository.save(vehicle);
    }
}