import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BookingService } from "../../../services/booking.service";
import { VehicleService } from "../../../services/vehicle.service";
import { AuthService } from "../../../services/auth.service";
import { ReviewService } from "../../../services/review.service";
import { PdfService } from "../../../services/pdf.service";
import { Booking } from "../../../models/booking.model";
import { Vehicle } from "../../../models/vehicle.model";
import { ReviewRequest } from "../../../models/review.model";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-booking-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./booking-list.component.html",
  styleUrls: ["./booking-list.component.css"],
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private vehicleService = inject(VehicleService);
  private authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private pdfService = inject(PdfService);

  bookings: Booking[] = [];
  vehicles: Vehicle[] = [];
  reviewedBookings: Set<number> = new Set();
  isLoading = false;

  // Review modal data
  selectedBooking: Booking | null = null;
  reviewData: ReviewRequest = {
    vehicleId: 0,
    bookingId: 0,
    rating: 0,
    comment: "",
  };
  isSubmittingReview = false;

  ngOnInit() {
    this.loadBookings();
    this.loadVehicles();
    this.loadReviewedBookings();
  }

  loadBookings() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.isLoading = true;

    this.bookingService.getUserBookings(currentUser.id!).subscribe({
      next: (bookings) => {
        this.bookings = bookings.sort(
          (a, b) =>
            new Date(b.bookingDate!).getTime() -
            new Date(a.bookingDate!).getTime()
        );
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadVehicles() {
    this.vehicleService.getVehicles(0, 1000).subscribe({
      next: (response) => {
        this.vehicles = response.content;
      },
    });
  }

  loadReviewedBookings() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.reviewService.getUserReviews(currentUser.id!).subscribe({
      next: (reviews) => {
        this.reviewedBookings = new Set(
          reviews.map((r) => r.bookingId!).filter((id) => id)
        );
      },
    });
  }

  getVehicle(vehicleId: number): Vehicle | undefined {
    return this.vehicles.find((v) => v.id === vehicleId);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case "CONFIRMED":
        return "bg-primary";
      case "ACTIVE":
        return "bg-success";
      case "COMPLETED":
        return "bg-secondary";
      case "CANCELLED":
        return "bg-danger";
      default:
        return "bg-warning";
    }
  }

  cancelBooking(bookingId: number) {
    if (confirm("Are you sure you want to cancel this booking?")) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          this.loadBookings();
          alert("Booking cancelled successfully");
        },
        error: () => {
          alert("Failed to cancel booking");
        },
      });
    }
  }

  completeBooking(bookingId: number) {
    if (confirm("Mark this booking as completed?")) {
      this.bookingService.completeBooking(bookingId).subscribe({
        next: () => {
          this.loadBookings();
          alert("Booking completed successfully");
        },
        error: () => {
          alert("Failed to complete booking");
        },
      });
    }
  }

  canCompleteBooking(booking: Booking): boolean {
    return this.bookingService.canCompleteBooking(booking);
  }

  canCancelBooking(booking: Booking): boolean {
    return this.bookingService.canCancelBooking(booking);
  }

  hasReview(bookingId: number): boolean {
    return this.reviewedBookings.has(bookingId);
  }

  openReviewModal(booking: Booking) {
    this.selectedBooking = booking;
    this.reviewData = {
      vehicleId: booking.vehicleId,
      bookingId: booking.id!,
      rating: 0,
      comment: "",
    };

    const modal = new (window as any).bootstrap.Modal(
      document.getElementById("reviewModal")
    );
    modal.show();
  }

  setRating(rating: number) {
    this.reviewData.rating = rating;
  }

  getRatingText(rating: number): string {
    const texts = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
    return texts[rating] || "";
  }

  submitReview() {
    if (this.isSubmittingReview) return;

    this.isSubmittingReview = true;

    this.reviewService.createReview(this.reviewData).subscribe({
      next: () => {
        this.isSubmittingReview = false;
        this.reviewedBookings.add(this.reviewData.bookingId);

        // Close modal
        const modal = (window as any).bootstrap.Modal.getInstance(
          document.getElementById("reviewModal")
        );
        modal.hide();

        alert("Review submitted successfully!");
      },
      error: () => {
        this.isSubmittingReview = false;
        alert("Failed to submit review");
      },
    });
  }

  downloadAgreement(booking: Booking) {
    const vehicle = this.getVehicle(booking.vehicleId);
    if (!vehicle) return;

    const agreementData = {
      id: booking.id,
      vehicleName: vehicle.name,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalAmount: booking.totalAmount,
    };

    this.pdfService.generateRentalAgreement(agreementData);
  }
}
