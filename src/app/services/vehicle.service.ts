import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { Vehicle, VehicleRequest } from "../models/vehicle.model";
import { AuthService } from "./auth.service"; // Adjust path if needed

@Injectable({
  providedIn: "root",
})
export class VehicleService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = "http://localhost:8080/api/vehicles";

  getVehicles(page: number = 0, size: number = 30): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  createVehicle(vehicleData: VehicleRequest): Observable<Vehicle> {
    const formData = new FormData();
    formData.append(
      "vehicle",
      JSON.stringify({
        name: vehicleData.name,
        type: vehicleData.type,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        pricePerDay: vehicleData.pricePerDay,
        location: vehicleData.location,
        description: vehicleData.description,
        features: vehicleData.features,
      })
    );

    // Append multiple images
    vehicleData.images.forEach((image, index) => {
      formData.append("images", image);
    });
    // Get JWT token
    const token = this.authService.getToken();
  let headers = new HttpHeaders();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return this.http.post<Vehicle>(this.apiUrl, formData, { headers });
  }

  updateVehicle(
    id: number,
    vehicleData: Partial<Vehicle>
  ): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicleData);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchVehicles(
    query: string,
    type?: string,
    minPrice?: number,
    maxPrice?: number
  ): Observable<Vehicle[]> {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (type) params.append("type", type);
    if (minPrice) params.append("minPrice", minPrice.toString());
    if (maxPrice) params.append("maxPrice", maxPrice.toString());

    return this.http.get<Vehicle[]>(
      `${this.apiUrl}/search?${params.toString()}`
    );
  }

  getUserVehicles(userId: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/user/${userId}`);
  }

  updateVehicleWithImages(id: number, formData: FormData): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, formData);
  }
}
