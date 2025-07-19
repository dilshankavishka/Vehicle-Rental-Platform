import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { VehicleService } from "../../../services/vehicle.service";
import { BookingService } from "../../../services/booking.service";
import { ReviewService } from "../../../services/review.service";
import { AuthService } from "../../../services/auth.service";
import { PdfService } from "../../../services/pdf.service";
import { Vehicle } from "../../../models/vehicle.model";
import { Booking } from "../../../models/booking.model";
import { Review } from "../../../models/review.model";

@Component({
  selector: "app-my-listings",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./my-listings.component.html",
  styleUrls: ["./my-listings.component.css"],
})
export class MyListingsComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private bookingService = inject(BookingService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private pdfService = inject(PdfService);
  private router = inject(Router);

  myVehicles: Vehicle[] = [];
  vehicleBookings: { [key: number]: Booking[] } = {};
  vehicleReviews: { [key: number]: Review[] } = {};
  isLoading = false;

  // Modal data
  selectedVehicleId = 0;
  selectedVehicleName = "";
  selectedVehicleReviews: Review[] = [];
  selectedVehicleBookings: Booking[] = [];
  selectedVehicleEarnings: Booking[] = [];

  ngOnInit() {
    this.loadMyVehicles();
  }

  loadMyVehicles() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.isLoading = true;

    this.vehicleService.getUserVehicles(currentUser.id!).subscribe({
      next: (vehicles) => {
        this.myVehicles = vehicles;
        this.loadBookingsForVehicles();
        this.loadReviewsForVehicles();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadBookingsForVehicles() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    this.bookingService.getOwnerBookings(currentUser.id!).subscribe({
      next: (bookings) => {
        // Group bookings by vehicle ID
        this.vehicleBookings = {};
        bookings.forEach((booking) => {
          if (!this.vehicleBookings[booking.vehicleId]) {
            this.vehicleBookings[booking.vehicleId] = [];
          }
          this.vehicleBookings[booking.vehicleId].push(booking);
        });
      },
    });
  }

  loadReviewsForVehicles() {
    this.myVehicles.forEach((vehicle) => {
      this.reviewService.getVehicleReviews(vehicle.id!).subscribe({
        next: (reviews) => {
          this.vehicleReviews[vehicle.id!] = reviews;
        },
      });
    });
  }

  getVehicleBookings(vehicleId: number): Booking[] {
    return this.vehicleBookings[vehicleId] || [];
  }

  getPendingBookings(vehicleId: number): Booking[] {
    return this.getVehicleBookings(vehicleId).filter(
      (b) => b.status === "PENDING"
    );
  }

  getActiveBookings(vehicleId: number): Booking[] {
    return this.getVehicleBookings(vehicleId).filter(
      (b) => b.status === "ACTIVE" || b.status === "CONFIRMED"
    );
  }

  getCompletedBookings(vehicleId: number): Booking[] {
    return this.getVehicleBookings(vehicleId).filter(
      (b) => b.status === "COMPLETED"
    );
  }

  getTotalEarnings(vehicleId: number): number {
    return this.getCompletedBookings(vehicleId).reduce(
      (sum, b) => sum + this.getOwnerEarnings(b.totalAmount),
      0
    );
  }

  getTotalEarningsForVehicle(vehicleId: number): number {
    return this.getTotalEarnings(vehicleId);
  }

  getAverageBookingValue(vehicleId: number): number {
    const completedBookings = this.getCompletedBookings(vehicleId);
    if (completedBookings.length === 0) return 0;
    return this.getTotalEarnings(vehicleId) / completedBookings.length;
  }

  // Calculate earnings breakdown (owner gets 95% after service charge)
  getBaseAmount(totalAmount: number): number {
    // Remove VAT first: totalAmount / 1.18
    const amountWithoutVat = totalAmount / 1.18;
    // Remove service charge: amountWithoutVat / 1.05
    return amountWithoutVat / 1.05;
  }

  getServiceCharge(totalAmount: number): number {
    const baseAmount = this.getBaseAmount(totalAmount);
    return baseAmount * 0.05;
  }

  getOwnerEarnings(totalAmount: number): number {
    return this.getBaseAmount(totalAmount);
  }

  getBookingCardClass(status: string): string {
    switch (status) {
      case "CONFIRMED":
        return "border-primary";
      case "ACTIVE":
        return "border-success";
      case "COMPLETED":
        return "border-secondary";
      case "CANCELLED":
        return "border-danger";
      default:
        return "border-warning";
    }
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

  approveBooking(bookingId: number) {
    this.bookingService.updateBookingStatus(bookingId, "CONFIRMED").subscribe({
      next: () => {
        this.loadBookingsForVehicles();
        alert("Booking approved successfully");
      },
      error: () => {
        alert("Failed to approve booking");
      },
    });
  }

  rejectBooking(bookingId: number) {
    this.bookingService.updateBookingStatus(bookingId, "CANCELLED").subscribe({
      next: () => {
        this.loadBookingsForVehicles();
        alert("Booking rejected");
      },
      error: () => {
        alert("Failed to reject booking");
      },
    });
  }

  toggleVehicleAvailability(vehicle: Vehicle) {
    const updatedVehicle = { ...vehicle, available: !vehicle.available };
    this.vehicleService.updateVehicle(vehicle.id!, updatedVehicle).subscribe({
      next: () => {
        vehicle.available = !vehicle.available;
        alert(
          `Vehicle ${
            vehicle.available ? "activated" : "deactivated"
          } successfully`
        );
      },
      error: () => {
        alert("Failed to update vehicle status");
      },
    });
  }

  editVehicle(vehicleId: number) {
    this.router.navigate(["/vehicles/edit", vehicleId]);
  }

  viewReviews(vehicleId: number) {
    const vehicle = this.myVehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    this.selectedVehicleId = vehicleId;
    this.selectedVehicleName = vehicle.name;
    this.selectedVehicleReviews = this.vehicleReviews[vehicleId] || [];

    const modal = new (window as any).bootstrap.Modal(
      document.getElementById("reviewsModal")
    );
    modal.show();
  }

  viewAllBookings(vehicleId: number) {
    const vehicle = this.myVehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    this.selectedVehicleId = vehicleId;
    this.selectedVehicleName = vehicle.name;
    this.selectedVehicleBookings = this.getVehicleBookings(vehicleId);

    const modal = new (window as any).bootstrap.Modal(
      document.getElementById("bookingsModal")
    );
    modal.show();
  }

  viewEarnings(vehicleId: number) {
    const vehicle = this.myVehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    this.selectedVehicleId = vehicleId;
    this.selectedVehicleName = vehicle.name;
    this.selectedVehicleEarnings = this.getCompletedBookings(vehicleId);

    const modal = new (window as any).bootstrap.Modal(
      document.getElementById("earningsModal")
    );
    modal.show();
  }

  downloadEarningsReport(vehicleId: number) {
    const vehicle = this.myVehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const completedBookings = this.getCompletedBookings(vehicleId);
    const reportData = {
      vehicleName: vehicle.name,
      vehicleId: vehicleId,
      totalEarnings: this.getTotalEarnings(vehicleId),
      bookingsCount: completedBookings.length,
      averageBooking: this.getAverageBookingValue(vehicleId),
      bookings: completedBookings.map((booking) => ({
        id: booking.id,
        renterName: booking.user?.name || `User ${booking.userId}`,
        startDate: booking.startDate,
        endDate: booking.endDate,
        baseAmount: this.getBaseAmount(booking.totalAmount),
        serviceCharge: this.getServiceCharge(booking.totalAmount),
        ownerEarnings: this.getOwnerEarnings(booking.totalAmount),
        completedDate: booking.bookingDate,
      })),
    };

    this.pdfService.generateEarningsReport(reportData);
  }

  deleteVehicle(vehicleId: number) {
    if (
      confirm(
        "Are you sure you want to delete this vehicle? This action cannot be undone."
      )
    ) {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => {
          this.loadMyVehicles();
          alert("Vehicle deleted successfully");
        },
        error: () => {
          alert("Failed to delete vehicle");
        },
      });
    }
  }
}
