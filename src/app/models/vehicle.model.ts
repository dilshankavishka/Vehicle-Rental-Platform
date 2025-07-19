export interface Vehicle {
  id?: number;
  name: string;
  type: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'SUV';
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  description: string;
  features: string[];
  rating?: number;
  reviewCount?: number;
  available: boolean;
  ownerId: number;
  ownerName?: string;
  images: string[];
  currentImageIndex?: number;
  createdDate?: Date;
}

export interface VehicleRequest {
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  description: string;
  features: string[];
  images: File[];
}