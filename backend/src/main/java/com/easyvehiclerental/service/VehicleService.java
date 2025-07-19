package com.easyvehiclerental.service;

import com.easyvehiclerental.controller.VehicleController;
import com.easyvehiclerental.dto.VehicleDto;
import com.easyvehiclerental.entity.User;
import com.easyvehiclerental.entity.Vehicle;
import com.easyvehiclerental.repository.UserRepository;
import com.easyvehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {
    
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public Page<VehicleDto> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findByAvailableTrue(pageable)
            .map(VehicleDto::fromEntity);
    }

    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        return VehicleDto.fromEntity(vehicle);
    }

    public List<VehicleDto> searchVehicles(String query, Vehicle.VehicleType type, 
                                          BigDecimal minPrice, BigDecimal maxPrice) {
        return vehicleRepository.searchVehicles(query, type, minPrice, maxPrice)
            .stream()
            .map(VehicleDto::fromEntity)
            .collect(Collectors.toList());
    }

    public List<VehicleDto> getUserVehicles(Long userId) {
        return vehicleRepository.findByOwnerId(userId)
            .stream()
            .map(VehicleDto::fromEntity)
            .collect(Collectors.toList());
    }

    public VehicleDto createVehicle(Vehicle vehicle, Long ownerId, List<MultipartFile> images) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));
        
        vehicle.setOwner(owner);
        
        // Handle image uploads
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = images.stream()
                .map(this::saveImage)
                .collect(Collectors.toList());
            vehicle.setImages(imageUrls);
        }
        
        vehicle = vehicleRepository.save(vehicle);
        return VehicleDto.fromEntity(vehicle);
    }

    public VehicleDto updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        vehicle.setName(vehicleDetails.getName());
        vehicle.setType(vehicleDetails.getType());
        vehicle.setBrand(vehicleDetails.getBrand());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setYear(vehicleDetails.getYear());
        vehicle.setPricePerDay(vehicleDetails.getPricePerDay());
        vehicle.setLocation(vehicleDetails.getLocation());
        vehicle.setDescription(vehicleDetails.getDescription());
        vehicle.setFeatures(vehicleDetails.getFeatures());
        vehicle.setAvailable(vehicleDetails.getAvailable());
        
        vehicle = vehicleRepository.save(vehicle);
        return VehicleDto.fromEntity(vehicle);
    }
    public VehicleDto updateVehicleWithImages(Long id, Vehicle vehicleDetails, List<MultipartFile> newImages) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Update basic vehicle details
        vehicle.setName(vehicleDetails.getName());
        vehicle.setType(vehicleDetails.getType());
        vehicle.setBrand(vehicleDetails.getBrand());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setYear(vehicleDetails.getYear());
        vehicle.setPricePerDay(vehicleDetails.getPricePerDay());
        vehicle.setLocation(vehicleDetails.getLocation());
        vehicle.setDescription(vehicleDetails.getDescription());
        vehicle.setFeatures(vehicleDetails.getFeatures());
        vehicle.setAvailable(vehicleDetails.getAvailable());

        // Handle image updates
        List<String> finalImages = new ArrayList<>();

        // Add existing images (from vehicleDetails.getImages() - these are the ones the user kept)
        if (vehicleDetails.getImages() != null && !vehicleDetails.getImages().isEmpty()) {
            finalImages.addAll(vehicleDetails.getImages());
        }

        // Add new images if provided
        if (newImages != null && !newImages.isEmpty()) {
            List<String> newImageUrls = newImages.stream()
                    .map(this::saveImage)
                    .collect(Collectors.toList());
            finalImages.addAll(newImageUrls);
        }

        vehicle.setImages(finalImages);

        vehicle = vehicleRepository.save(vehicle);
        return VehicleDto.fromEntity(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        // Check if vehicle has active bookings
        // if (hasActiveBookings(id)) {
        //     throw new RuntimeException("Cannot delete vehicle with active bookings");
        // }
        
        vehicleRepository.deleteById(id);
    }

    public VehicleController.VehicleStatsDto getVehicleStats() {
        long totalVehicles = vehicleRepository.count();
        long availableVehicles = vehicleRepository.countByAvailableTrue();
        long carCount = vehicleRepository.countByType(Vehicle.VehicleType.CAR);
        long suvCount = vehicleRepository.countByType(Vehicle.VehicleType.SUV);
        long truckCount = vehicleRepository.countByType(Vehicle.VehicleType.TRUCK);
        long motorcycleCount = vehicleRepository.countByType(Vehicle.VehicleType.MOTORCYCLE);
        
        return new VehicleController.VehicleStatsDto(
            totalVehicles, availableVehicles, carCount, suvCount, truckCount, motorcycleCount
        );
    }

    private String saveImage(MultipartFile image) {
        try {
            // Ensure uploads directory exists
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }
            // Generate a unique filename to avoid collisions
            String filename = java.util.UUID.randomUUID() + "~" + image.getOriginalFilename();
            java.nio.file.Path filePath = uploadDir.resolve(filename);
            image.transferTo(filePath.toFile());
            // Return only the filename (not full path)
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save image: " + e.getMessage());
        }
    }
}