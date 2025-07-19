package com.easyvehiclerental.repository;

import com.easyvehiclerental.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByVehicleIdOrderByCreatedDateDesc(Long vehicleId);
    
    List<Review> findByUserIdOrderByCreatedDateDesc(Long userId);
    
    boolean existsByBookingId(Long bookingId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vehicle.id = :vehicleId")
    BigDecimal getAverageRatingByVehicleId(@Param("vehicleId") Long vehicleId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.vehicle.id = :vehicleId")
    long getReviewCountByVehicleId(@Param("vehicleId") Long vehicleId);
    
    @Query("SELECT r FROM Review r WHERE r.vehicle.owner.id = :ownerId ORDER BY r.createdDate DESC")
    List<Review> findByVehicleOwnerIdOrderByCreatedDateDesc(@Param("ownerId") Long ownerId);
}