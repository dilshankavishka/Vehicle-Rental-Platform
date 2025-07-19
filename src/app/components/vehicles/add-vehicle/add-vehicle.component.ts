import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { VehicleService } from "../../../services/vehicle.service";
import { VehicleRequest } from "../../../models/vehicle.model";

@Component({
  selector: "app-add-vehicle",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./add-vehicle.component.html",
  styleUrls: ["./add-vehicle.component.css"],
})
export class AddVehicleComponent {
  private vehicleService = inject(VehicleService);
  private router = inject(Router);

  vehicleData: VehicleRequest = {
    name: "",
    type: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    pricePerDay: 0,
    location: "",
    description: "",
    features: [],
    images: [],
  };

  featuresString = "";
  imagePreviews: string[] = [];
  currentYear = new Date().getFullYear();
  isSubmitting = false;
  showSuccess = false;
  errorMessage = "";

  onFileSelect(event: any) {
    const files = event.target.files;
    this.vehicleData.images = [];
    this.imagePreviews = [];

    for (const element of files) {
      const file = element;
      this.vehicleData.images.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.vehicleData.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = "";

    // Parse features
    this.vehicleData.features = this.featuresString
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    this.vehicleService.createVehicle(this.vehicleData).subscribe({
      next: (vehicle) => {
        this.isSubmitting = false;
        this.showSuccess = true;

        // Show success modal
        const modal = new (window as any).bootstrap.Modal(
          document.getElementById("successModal")
        );
        modal.show();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          "Failed to create vehicle listing. Please try again.";
      },
    });
  }

  closeSuccessModal() {
    this.showSuccess = false;
    this.router.navigate(["/vehicles"]);
  }

  goBack() {
    this.router.navigate(["/dashboard"]);
  }
}
