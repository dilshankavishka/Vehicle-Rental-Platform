package com.easyvehiclerental.dto;

import com.easyvehiclerental.entity.Review;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdDate;
    private Long vehicleId;
    private String vehicleName;
    private Long userId;
    private String userName;
    private Long bookingId;

    public static ReviewDto fromEntity(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedDate(review.getCreatedDate());
        dto.setVehicleId(review.getVehicle().getId());
        dto.setVehicleName(review.getVehicle().getName());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getName());
        dto.setBookingId(review.getBooking().getId());
        return dto;
    }
}