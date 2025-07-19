export interface Booking {
  id?: number;
  vehicleId: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bookingDate?: Date;
  vehicle?: any;
  user?: any;
  termsAccepted: boolean;
  agreementUrl?: string;
}

export interface BookingRequest {
  vehicleId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  termsAccepted: boolean;
}