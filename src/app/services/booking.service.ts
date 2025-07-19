import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Booking, BookingRequest } from "../models/booking.model";

@Injectable({
  providedIn: "root",
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:8080/api/bookings";

  createBooking(bookingData: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, bookingData);
  }

  getUserBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  updateBookingStatus(bookingId: number, status: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/status`, {
      status,
    });
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${bookingId}/cancel`, {});
  }

  completeBooking(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/complete`, {});
  }

  getOwnerBookings(ownerId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  generateAgreement(bookingId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${bookingId}/agreement`, {
      responseType: "blob",
    });
  }
  canCompleteBooking(booking: Booking): boolean {
    // A booking can be completed if:
    // 1. It's currently ACTIVE (rental period is ongoing)
    // 2. The end date has passed or is today
    // 3. It's not already completed or cancelled

    if (!booking.status || !booking.endDate) return false;

    const now = new Date();
    const endDate = new Date(booking.endDate);

    return booking.status === "ACTIVE" && endDate <= now;
  }

  canCancelBooking(booking: Booking): boolean {
    // A booking can be cancelled if:
    // 1. It's CONFIRMED (not yet active)
    // 2. Or it's ACTIVE but the start date hasn't passed yet
    // 3. It's not already completed or cancelled

    if (!booking.status || !booking.startDate) return false;

    const now = new Date();
    const startDate = new Date(booking.startDate);

    return (
      booking.status === "CONFIRMED" ||
      (booking.status === "ACTIVE" && startDate > now)
    );
  }
}
