import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { VehicleService } from "../../../services/vehicle.service";
import { Vehicle } from "../../../models/vehicle.model";

@Component({
  selector: "app-vehicle-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./vehicle-list.component.html",
  styleUrls: ["./vehicle-list.component.css"],
})
export class VehicleListComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private router = inject(Router);

  vehicles: Vehicle[] = [];
  totalVehicles = 0;
  currentPage = 0;
  totalPages = 0;
  pageSize = 30;

  searchQuery = "";
  selectedType = "ALL";
  minPrice?: number;
  maxPrice?: number;

  isLoading = false;

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.isLoading = true;

    if (
      this.searchQuery ||
      this.selectedType !== "ALL" ||
      this.minPrice ||
      this.maxPrice
    ) {
      this.vehicleService
        .searchVehicles(
          this.searchQuery,
          this.selectedType === "ALL" ? undefined : this.selectedType,
          this.minPrice,
          this.maxPrice
        )
        .subscribe({
          next: (vehicles) => {
            this.vehicles = this.initializeImageIndexes(vehicles);
            this.totalVehicles = vehicles.length;
            this.totalPages = 1;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
    } else {
      this.vehicleService
        .getVehicles(this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.vehicles = this.initializeImageIndexes(response.content);
            this.totalVehicles = response.totalElements;
            this.totalPages = response.totalPages;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
    }
  }

  // Initialize image indexes for carousel functionality
  initializeImageIndexes(vehicles: Vehicle[]): Vehicle[] {
    return vehicles.map((vehicle) => ({
      ...vehicle,
      currentImageIndex: 0,
    }));
  }

  onSearch() {
    this.currentPage = 0;
    this.loadVehicles();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadVehicles();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Image carousel functions
  nextImage(vehicle: any, event: Event) {
    event.stopPropagation();
    if (vehicle.images.length > 1) {
      vehicle.currentImageIndex =
        (vehicle.currentImageIndex + 1) % vehicle.images.length;
    }
  }

  prevImage(vehicle: any, event: Event) {
    event.stopPropagation();
    if (vehicle.images.length > 1) {
      vehicle.currentImageIndex =
        vehicle.currentImageIndex === 0
          ? vehicle.images.length - 1
          : vehicle.currentImageIndex - 1;
    }
  }

  viewVehicleDetails(vehicleId: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(["/vehicles", vehicleId]);
  }
}
