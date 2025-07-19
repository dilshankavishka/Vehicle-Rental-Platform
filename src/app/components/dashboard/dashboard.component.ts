import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { VehicleService } from "../../services/vehicle.service";
import { BookingService } from "../../services/booking.service";
import { User } from "../../models/user.model";
import { Vehicle } from "../../models/vehicle.model";
import { Booking } from "../../models/booking.model";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private vehicleService = inject(VehicleService);
  private bookingService = inject(BookingService);

  currentUser: User | null = null;
  currentDate = new Date();
  userBookings: Booking[] = [];
  userVehicles: Vehicle[] = [];
  recentBookings: Booking[] = [];
  pendingOwnerBookings: Booking[] = [];
  activeBookings = 0;
  totalEarnings = 0;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    if (!this.currentUser) return;

    // Load user bookings
    this.bookingService
      .getUserBookings(this.currentUser.id!)
      .subscribe((bookings) => {
        this.userBookings = bookings;
        this.activeBookings = bookings.filter(
          (b) => b.status === "ACTIVE" || b.status === "CONFIRMED"
        ).length;
        this.recentBookings = bookings.slice(0, 5);
      });

    // Load user vehicles
    this.vehicleService
      .getUserVehicles(this.currentUser.id!)
      .subscribe((vehicles) => {
        this.userVehicles = vehicles;
      });

    // Load pending bookings for user's vehicles (as owner)
    this.bookingService
      .getOwnerBookings(this.currentUser.id!)
      .subscribe((bookings) => {
        this.pendingOwnerBookings = bookings.filter(
          (b) => b.status === "PENDING"
        );

        // Calculate total earnings from completed bookings
        this.totalEarnings = bookings
          .filter((b) => b.status === "COMPLETED")
          .reduce((sum, b) => sum + b.totalAmount, 0);
      });
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
    this.bookingService
      .updateBookingStatus(bookingId, "CONFIRMED")
      .subscribe(() => {
        this.loadDashboardData();
      });
  }

  rejectBooking(bookingId: number) {
    this.bookingService
      .updateBookingStatus(bookingId, "CANCELLED")
      .subscribe(() => {
        this.loadDashboardData();
      });
  }
}
