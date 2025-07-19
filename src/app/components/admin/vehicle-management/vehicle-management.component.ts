import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VehicleService } from "../../../services/vehicle.service";
import { Vehicle } from "../../../models/vehicle.model";

@Component({
  selector: "app-vehicle-management",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./vehicle-management.component.html",
  styleUrls: ["./vehicle-management.component.css"],
})
export class VehicleManagementComponent implements OnInit {
  private vehicleService = inject(VehicleService);

  vehicles: Vehicle[] = [];

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.vehicleService.getVehicles(0, 1000).subscribe({
      next: (response) => {
        this.vehicles = response.content;
      },
    });
  }

  deleteVehicle(vehicleId: number) {
    if (
      confirm(
        "Are you sure you want to delete this vehicle? This action cannot be undone."
      )
    ) {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => {
          this.loadVehicles();
          alert("Vehicle deleted successfully");
        },
        error: (error) => {
          console.error("Error deleting vehicle:", error);
          alert("Failed to delete vehicle");
        },
      });
    }
  }
}
