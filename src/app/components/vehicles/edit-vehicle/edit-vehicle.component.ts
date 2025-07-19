import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { VehicleService } from "../../../services/vehicle.service";
import { Vehicle } from "../../../models/vehicle.model";

@Component({
  selector: "app-edit-vehicle",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./edit-vehicle.component.html",
  styleUrls: ["./edit-vehicle.component.css"],
})
export class EditVehicleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);

  vehicle: Vehicle | null = null;
  featuresString = "";
  newImages: File[] = [];
  newImagePreviews: string[] = [];
  currentYear = new Date().getFullYear();
  isLoading = false;
  isSubmitting = false;
  errorMessage = "";

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
        this.featuresString = vehicle.features.join(", ");
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(["/vehicles/my-listings"]);
      },
    });
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    this.newImages = [];
    this.newImagePreviews = [];

    for (const element of files) {
      const file = element;
      this.newImages.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newImagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeExistingImage(index: number) {
    if (this.vehicle?.images) {
      this.vehicle.images.splice(index, 1);
    }
  }

  removeNewImage(index: number) {
    this.newImages.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  onSubmit() {
    if (this.isSubmitting || !this.vehicle) return;

    this.isSubmitting = true;
    this.errorMessage = "";

    // Parse features
    this.vehicle.features = this.featuresString
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // If there are new images, create FormData for multipart upload
    if (this.newImages.length > 0) {
      const formData = new FormData();
      formData.append(
        "vehicle",
        JSON.stringify({
          name: this.vehicle.name,
          type: this.vehicle.type,
          brand: this.vehicle.brand,
          model: this.vehicle.model,
          year: this.vehicle.year,
          pricePerDay: this.vehicle.pricePerDay,
          location: this.vehicle.location,
          description: this.vehicle.description,
          features: this.vehicle.features,
          available: this.vehicle.available,
          existingImages: this.vehicle.images,
        })
      );

      this.newImages.forEach((image, index) => {
        formData.append("newImages", image);
      });

      this.vehicleService
        .updateVehicleWithImages(this.vehicle.id!, formData)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            alert("Vehicle updated successfully!");
            this.router.navigate(["/vehicles/my-listings"]);
          },
          error: () => {
            this.isSubmitting = false;
            this.errorMessage = "Failed to update vehicle. Please try again.";
          },
        });
    } else {
      // Update without new images
      this.vehicleService
        .updateVehicle(this.vehicle.id!, this.vehicle)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            alert("Vehicle updated successfully!");
            this.router.navigate(["/vehicles/my-listings"]);
          },
          error: () => {
            this.isSubmitting = false;
            this.errorMessage = "Failed to update vehicle. Please try again.";
          },
        });
    }
  }

  goBack() {
    this.router.navigate(["/vehicles/my-listings"]);
  }
}
