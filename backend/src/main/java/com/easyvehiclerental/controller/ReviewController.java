package com.easyvehiclerental.controller;

import com.easyvehiclerental.dto.ReviewDto;
import com.easyvehiclerental.dto.ReviewRequest;
import com.easyvehiclerental.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ReviewDto>> getVehicleReviews(@PathVariable Long vehicleId) {
        List<ReviewDto> reviews = reviewService.getVehicleReviews(vehicleId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDto>> getUserReviews(@PathVariable Long userId) {
        List<ReviewDto> reviews = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        // In real implementation, get user ID from JWT token
        Long userId = 1L; // Demo user ID
        ReviewDto review = reviewService.createReview(request, userId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ReviewDto>> getOwnerReviews(@PathVariable Long ownerId) {
        List<ReviewDto> reviews = reviewService.getOwnerReviews(ownerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/booking/{bookingId}/exists")
    public ResponseEntity<Boolean> checkReviewExists(@PathVariable Long bookingId) {
        boolean exists = reviewService.reviewExistsForBooking(bookingId);
        return ResponseEntity.ok(exists);
    }
}