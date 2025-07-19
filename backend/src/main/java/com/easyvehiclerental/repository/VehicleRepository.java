package com.easyvehiclerental.repository;

import com.easyvehiclerental.entity.Vehicle;
import com.easyvehiclerental.entity.Vehicle.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    Page<Vehicle> findByAvailableTrue(Pageable pageable);
    
    List<Vehicle> findByOwnerId(Long ownerId);
    
    @Query("SELECT v FROM Vehicle v WHERE v.available = true AND " +
           "(:query IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.location) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:type IS NULL OR v.type = :type) AND " +
           "(:minPrice IS NULL OR v.pricePerDay >= :minPrice) AND " +
           "(:maxPrice IS NULL OR v.pricePerDay <= :maxPrice)")
    List<Vehicle> searchVehicles(@Param("query") String query,
                                @Param("type") VehicleType type,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice);
    
    long countByAvailableTrue();
    
    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.type = :type")
    long countByType(@Param("type") VehicleType type);
}