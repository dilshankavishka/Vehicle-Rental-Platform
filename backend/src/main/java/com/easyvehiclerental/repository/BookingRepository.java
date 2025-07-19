package com.easyvehiclerental.repository;

import com.easyvehiclerental.entity.Booking;
import com.easyvehiclerental.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);
    
    @Query("SELECT b FROM Booking b WHERE b.vehicle.owner.id = :ownerId ORDER BY b.bookingDate DESC")
    List<Booking> findByVehicleOwnerIdOrderByBookingDateDesc(@Param("ownerId") Long ownerId);
    
    List<Booking> findByStatusOrderByBookingDateDesc(BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId AND " +
           "b.status IN ('CONFIRMED', 'ACTIVE') AND " +
           "((b.startDate <= :endDate) AND (b.endDate >= :startDate))")
    List<Booking> findConflictingBookings(@Param("vehicleId") Long vehicleId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();
    
    long countByStatus(BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status IN ('ACTIVE', 'CONFIRMED')")
    long countActiveBookings();
}