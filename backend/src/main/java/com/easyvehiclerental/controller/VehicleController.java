package com.easyvehiclerental.controller;

import com.easyvehiclerental.dto.VehicleDto;
import com.easyvehiclerental.entity.Vehicle;
import com.easyvehiclerental.service.VehicleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class VehicleController {
    
    private final VehicleService vehicleService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<Page<VehicleDto>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VehicleDto> vehicles = vehicleService.getAllVehicles(pageable);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable Long id) {
        VehicleDto vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    @GetMapping("/search")
    public ResponseEntity<List<VehicleDto>> searchVehicles(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Vehicle.VehicleType type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        List<VehicleDto> vehicles = vehicleService.searchVehicles(query, type, minPrice, maxPrice);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VehicleDto>> getUserVehicles(@PathVariable Long userId) {
        List<VehicleDto> vehicles = vehicleService.getUserVehicles(userId);
        return ResponseEntity.ok(vehicles);
    }

    @PostMapping
    public ResponseEntity<VehicleDto> createVehicle(
            @RequestParam("vehicle") String vehicleJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {
        try {
            Vehicle vehicle = objectMapper.readValue(vehicleJson, Vehicle.class);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // Get user ID from JWT token or user service
            Long ownerId = ((com.easyvehiclerental.entity.User) userDetails).getId();
            
            VehicleDto createdVehicle = vehicleService.createVehicle(vehicle, ownerId, images);
            return ResponseEntity.ok(createdVehicle);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create vehicle: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(
            @PathVariable Long id,
            @RequestParam("vehicle") String vehicleJson,
            @RequestParam(value = "newImages", required = false) List<MultipartFile> newImages,
            Authentication authentication) {
        try {
            Vehicle vehicleDetails = objectMapper.readValue(vehicleJson, Vehicle.class);
            VehicleDto updatedVehicle = vehicleService.updateVehicleWithImages(id, vehicleDetails, newImages);
            return ResponseEntity.ok(updatedVehicle);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update vehicle: " + e.getMessage());
        }
    }

    // Keep the original PUT method for updates without images, but rename it
    @PutMapping("/{id}/basic")
    public ResponseEntity<VehicleDto> updateVehicleBasic(
            @PathVariable Long id,
            @Valid @RequestBody Vehicle vehicleDetails) {
        VehicleDto updatedVehicle = vehicleService.updateVehicle(id, vehicleDetails);
        return ResponseEntity.ok(updatedVehicle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<VehicleStatsDto> getVehicleStats() {
        VehicleStatsDto stats = vehicleService.getVehicleStats();
        return ResponseEntity.ok(stats);
    }

    // DTO for vehicle statistics
    @Data
    public static class VehicleStatsDto {
        private long totalVehicles;
        private long availableVehicles;
        private long carCount;
        private long suvCount;
        private long truckCount;
        private long motorcycleCount;
        
        // Constructors, getters, and setters
        public VehicleStatsDto() {}
        
        public VehicleStatsDto(long totalVehicles, long availableVehicles, 
                              long carCount, long suvCount, long truckCount, long motorcycleCount) {
            this.totalVehicles = totalVehicles;
            this.availableVehicles = availableVehicles;
            this.carCount = carCount;
            this.suvCount = suvCount;
            this.truckCount = truckCount;
            this.motorcycleCount = motorcycleCount;
        }
    }
}