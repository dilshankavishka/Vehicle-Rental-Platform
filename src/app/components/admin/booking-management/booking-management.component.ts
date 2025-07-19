import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BookingService } from "../../../services/booking.service";
import { VehicleService } from "../../../services/vehicle.service";
import { Booking } from "../../../models/booking.model";
import { Vehicle } from "../../../models/vehicle.model";

@Component({
  selector: "app-booking-management",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./booking-management.component.html",
  styleUrls: ["./booking-management.component.css"],
})
export class BookingManagementComponent implements OnInit {
  private bookingService = inject(BookingService);
  private vehicleService = inject(VehicleService);

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  vehicles: Vehicle[] = [];
  statusFilter = "ALL";

  ngOnInit() {
    this.loadBookings();
    this.loadVehicles();
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings.sort(
          (a, b) =>
            new Date(b.bookingDate!).getTime() -
            new Date(a.bookingDate!).getTime()
        );
        this.filterBookings();
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

  filterBookings() {
    if (this.statusFilter === "ALL") {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(
        (b) => b.status === this.statusFilter
      );
    }
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

  getDuration(booking: Booking): number {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  updateStatus(bookingId: number, status: string) {
    this.bookingService.updateBookingStatus(bookingId, status).subscribe({
      next: () => {
        this.loadBookings();
      },
    });
  }
}
