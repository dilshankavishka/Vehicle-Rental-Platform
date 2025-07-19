package com.easyvehiclerental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Vehicle name is required")
    @Size(max = 100, message = "Vehicle name must not exceed 100 characters")
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    @NotBlank(message = "Brand is required")
    @Size(max = 50, message = "Brand must not exceed 50 characters")
    @Column(nullable = false)
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 50, message = "Model must not exceed 50 characters")
    @Column(nullable = false)
    private String model;

    @Min(value = 1900, message = "Year must be after 1900")
    @Max(value = 2025, message = "Year must not exceed 2025")
    @Column(nullable = false)
    private Integer year;

    @NotNull(message = "Price per day is required")
    @DecimalMin(value = "1.0", message = "Price per day must be at least 1")
    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location must not exceed 100 characters")
    @Column(nullable = false)
    private String location;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(nullable = false, length = 1000)
    private String description;

    @ElementCollection
    @CollectionTable(name = "vehicle_features", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "feature")
    private List<String> features;

    @ElementCollection
    @CollectionTable(name = "vehicle_images", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "image_url")
    private List<String> images;

    @Column(nullable = false)
    private Boolean available = true;

    @DecimalMin(value = "0.0", message = "Rating must be non-negative")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Min(value = 0, message = "Review count must be non-negative")
    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    public enum VehicleType {
        CAR, SUV, TRUCK, MOTORCYCLE
    }
}