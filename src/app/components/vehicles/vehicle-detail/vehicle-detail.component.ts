import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { VehicleService } from "../../../services/vehicle.service";
import { BookingService } from "../../../services/booking.service";
import { AuthService } from "../../../services/auth.service";
import { Vehicle } from "../../../models/vehicle.model";
import { BookingRequest } from "../../../models/booking.model";
import { Review } from "../../../models/review.model";
import { ReviewService } from "../../../services/review.service";

@Component({
  selector: "app-vehicle-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./vehicle-detail.component.html",
  styleUrls: ["./vehicle-detail.component.css"],
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private reviewService = inject(ReviewService);

  vehicle: Vehicle | null = null;
  reviews: Review[] = [];
  currentImageIndex = 0;
  isLoading = false;
  isBooking = false;
  isLoadingReviews = false;

  bookingData: BookingRequest = {
    vehicleId: 0,
    startDate: "",
    endDate: "",
    totalAmount: 0,
    termsAccepted: false,
  };

  // Pricing breakdown
  baseAmount = 0;
  serviceCharge = 0;
  vat = 0;
  totalAmount = 0;

  minDate = new Date().toISOString().split("T")[0];

  ngOnInit() {
    const vehicleId = this.route.snapshot.params["id"];
    if (vehicleId) {
      this.loadVehicle(Number(vehicleId));
    }
  }

  loadVehicle(id: number) {
    this.isLoading = true;

    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        this.vehicle = vehicle;
        this.bookingData.vehicleId = vehicle.id!;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(["/vehicles"]);
      },
    });
  }
  loadReviews(vehicleId: number) {
    this.isLoadingReviews = true;

    this.reviewService.getVehicleReviews(vehicleId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoadingReviews = false;
      },
      error: (error) => {
        console.error("Error loading reviews:", error);
        this.reviews = [];
        this.isLoadingReviews = false;
      },
    });
  }
  nextImage() {
    if (this.vehicle && this.vehicle.images.length > 1) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.vehicle.images.length;
    }
  }

  prevImage() {
    if (this.vehicle && this.vehicle.images.length > 1) {
      this.currentImageIndex =
        this.currentImageIndex === 0
          ? this.vehicle.images.length - 1
          : this.currentImageIndex - 1;
    }
  }

  calculatePricing() {
    if (
      this.bookingData.startDate &&
      this.bookingData.endDate &&
      this.vehicle
    ) {
      const days = this.getDays();
      this.baseAmount = days * this.vehicle.pricePerDay;
      this.serviceCharge = this.baseAmount * 0.05; // 5% service charge
      this.vat = (this.baseAmount + this.serviceCharge) * 0.18; // 18% VAT
      this.totalAmount = this.baseAmount + this.serviceCharge + this.vat;
      this.bookingData.totalAmount = this.totalAmount;
    }
  }

  getDays(): number {
    if (!this.bookingData.startDate || !this.bookingData.endDate) return 0;

    const start = new Date(this.bookingData.startDate);
    const end = new Date(this.bookingData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onBookingSubmit() {
    if (this.isBooking || !this.vehicle) return;

    this.isBooking = true;

    this.bookingService.createBooking(this.bookingData).subscribe({
      next: (booking) => {
        this.isBooking = false;
        alert("Booking created successfully!");
        this.router.navigate(["/bookings"]);
      },
      error: () => {
        this.isBooking = false;
        alert("Failed to create booking. Please try again.");
      },
    });
  }

  goBack() {
    this.router.navigate(["/vehicles"]);
  }
}
