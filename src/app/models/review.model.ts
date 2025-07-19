export interface Review {
  id?: number;
  vehicleId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  bookingId?: number;
}

export interface ReviewRequest {
  vehicleId: number;
  bookingId: number;
  rating: number;
  comment: string;
}