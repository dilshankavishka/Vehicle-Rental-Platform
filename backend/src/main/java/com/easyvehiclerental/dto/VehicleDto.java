package com.easyvehiclerental.dto;

import com.easyvehiclerental.entity.Vehicle;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VehicleDto {
    private Long id;
    private String name;
    private Vehicle.VehicleType type;
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal pricePerDay;
    private String location;
    private String description;
    private List<String> features;
    private List<String> images;
    private Boolean available;
    private BigDecimal rating;
    private Integer reviewCount;
    private LocalDateTime createdDate;
    private Long ownerId;
    private String ownerName;

    public static VehicleDto fromEntity(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        dto.setName(vehicle.getName());
        dto.setType(vehicle.getType());
        dto.setBrand(vehicle.getBrand());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setPricePerDay(vehicle.getPricePerDay());
        dto.setLocation(vehicle.getLocation());
        dto.setDescription(vehicle.getDescription());
        dto.setFeatures(vehicle.getFeatures());
        dto.setImages(vehicle.getImages());
        dto.setAvailable(vehicle.getAvailable());
        dto.setRating(vehicle.getRating());
        dto.setReviewCount(vehicle.getReviewCount());
        dto.setCreatedDate(vehicle.getCreatedDate());
        dto.setOwnerId(vehicle.getOwner().getId());
        dto.setOwnerName(vehicle.getOwner().getName());
        return dto;
    }
}