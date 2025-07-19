import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Review, ReviewRequest } from "../models/review.model";

@Injectable({
  providedIn: "root",
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:8080/api/reviews";

  getVehicleReviews(vehicleId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/vehicle/${vehicleId}`);
  }

  createReview(reviewData: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, reviewData);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  getUserReviews(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/${userId}`);
  }

  getOwnerReviews(ownerId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  checkReviewExists(bookingId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/booking/${bookingId}/exists`);
  }
}
