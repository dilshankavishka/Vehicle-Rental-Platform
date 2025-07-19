import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Chart, ChartConfiguration, ChartType, registerables } from "chart.js";
import { VehicleService } from "../../../services/vehicle.service";
import { BookingService } from "../../../services/booking.service";
import { AuthService } from "../../../services/auth.service";
import { PdfService } from "../../../services/pdf.service";
import { Vehicle } from "../../../models/vehicle.model";
import { Booking } from "../../../models/booking.model";
import { User } from "../../../models/user.model";

Chart.register(...registerables);

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild("transactionChart") transactionChartRef!: ElementRef;
  @ViewChild("revenueChart") revenueChartRef!: ElementRef;

  private vehicleService = inject(VehicleService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private pdfService = inject(PdfService);

  vehicles: Vehicle[] = [];
  bookings: Booking[] = [];
  users: User[] = [];
  recentBookings: Booking[] = [];

  totalRevenue = 0;
  activeBookings = 0;
  availableVehicles = 0;
  totalUsers = 0;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load vehicles
    this.vehicleService.getVehicles(0, 1000).subscribe((response) => {
      this.vehicles = response.content;
      this.availableVehicles = this.vehicles.filter((v) => v.available).length;
    });

    // Load bookings
    this.bookingService.getAllBookings().subscribe((bookings) => {
      this.bookings = bookings;
      this.activeBookings = bookings.filter(
        (b) => b.status === "ACTIVE"
      ).length;

      // Calculate service charge revenue (5% of base amount from completed bookings)
      this.totalRevenue = bookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => {
          const baseAmount = this.getBaseAmount(b.totalAmount);
          return sum + baseAmount * 0.05;
        }, 0);

      this.recentBookings = bookings
        .sort(
          (a, b) =>
            new Date(b.bookingDate!).getTime() -
            new Date(a.bookingDate!).getTime()
        )
        .slice(0, 10);

      this.createTransactionChart();
      this.createRevenueChart();
    });

    // Load users

    this.authService.getAllUsers().subscribe((users) => {
      this.users = users;
      this.totalUsers = users.length;
    });
  }

  getBaseAmount(totalAmount: number): number {
    // Remove VAT first: totalAmount / 1.18
    const amountWithoutVat = totalAmount / 1.18;
    // Remove service charge: amountWithoutVat / 1.05
    return amountWithoutVat / 1.05;
  }

  createTransactionChart() {
    if (!this.transactionChartRef) return;

    const ctx = this.transactionChartRef.nativeElement.getContext("2d");

    // Generate monthly transaction data
    const monthlyData = this.generateMonthlyTransactionData();

    new Chart(ctx, {
      type: "line",
      data: {
        labels: monthlyData.map((d) => d.month),
        datasets: [
          {
            label: "Transactions",
            data: monthlyData.map((d) => d.count),
            backgroundColor: "rgba(53, 99, 233, 0.1)",
            borderColor: "rgba(53, 99, 233, 1)",
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  createRevenueChart() {
    if (!this.revenueChartRef) return;

    const ctx = this.revenueChartRef.nativeElement.getContext("2d");

    // Generate monthly data from actual bookings
    const monthlyData = this.generateMonthlyRevenueData();

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: monthlyData.map((d) => d.month),
        datasets: [
          {
            label: "Service Charge Revenue (LKR)",
            data: monthlyData.map((d) => d.revenue),
            backgroundColor: "rgba(53, 99, 233, 0.8)",
            borderColor: "rgba(53, 99, 233, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "LKR " + value;
              },
            },
          },
        },
      },
    });
  }

  generateMonthlyTransactionData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    return months.map((month, index) => {
      // Calculate transaction count for each month
      const monthTransactions = this.bookings.filter((b) => {
        const bookingMonth = new Date(b.bookingDate!).getMonth();
        return bookingMonth === index;
      }).length;

      return {
        month,
        count: monthTransactions || Math.floor(Math.random() * 20) + 5, // Demo fallback
      };
    });
  }

  generateMonthlyRevenueData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
      // Calculate service charge revenue from completed bookings for each month
      const monthRevenue = this.bookings
        .filter((b) => {
          const bookingMonth = new Date(b.bookingDate!).getMonth();
          return bookingMonth === index && b.status === "COMPLETED";
        })
        .reduce((sum, b) => {
          const baseAmount = this.getBaseAmount(b.totalAmount);
          return sum + baseAmount * 0.05;
        }, 0);

      return {
        month,
        revenue: monthRevenue || Math.floor(Math.random() * 5000) + 1000, // Demo fallback
      };
    });
  }

  getVehicleName(vehicleId: number): string {
    const vehicle = this.vehicles.find((v) => v.id === vehicleId);
    return vehicle?.name || "Unknown Vehicle";
  }

  getUserName(userId: number): string {
    const user = this.users.find((u) => u.id === userId);
    return user?.name || `User ${userId}`;
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

  generateReport(reportType: string) {
    try {
      let data: any[] = [];

      switch (reportType) {
        case "Vehicles":
          data = this.vehicles;
          break;
        case "Bookings":
          data = this.bookings;
          break;
        case "Users":
          data = this.users;
          break;
      }

      this.pdfService.generateMonthlyReport(reportType, data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    }
  }
}
