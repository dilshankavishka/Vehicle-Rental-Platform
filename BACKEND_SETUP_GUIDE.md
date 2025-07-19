# Backend Setup Guide for EasyVehicleRental

This guide will help you set up the Spring Boot backend and connect it to the Angular frontend.

## Prerequisites

1. Java 17 or higher
2. MySQL 8.0 or higher
3. Maven 3.6 or higher
4. Node.js 18 or higher
5. Angular CLI 18

## Backend Setup Steps

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE easyvehiclerental;

-- Create user (optional)
CREATE USER 'rental_user'@'localhost' IDENTIFIED BY 'rental_password';
GRANT ALL PRIVILEGES ON easyvehiclerental.* TO 'rental_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configure Application Properties

Update `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/easyvehiclerental?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080

# JWT Configuration
jwt.secret=mySecretKey123456789012345678901234567890
jwt.expiration=86400000

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# CORS Configuration
cors.allowed-origins=http://localhost:4200

# Logging
logging.level.com.easyvehiclerental=DEBUG
logging.level.org.springframework.security=DEBUG
```

### 3. Start Backend Server

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Test Backend APIs

Test if the backend is running:
```bash
curl http://localhost:8080/api/vehicles
```

## Frontend Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### 3. Remove Demo Code and Connect to Backend

Follow these steps to connect each service to the backend:

#### AuthService (`src/app/services/auth.service.ts`)

**REMOVE these demo sections:**
```typescript
// Remove the demoUsers array
private demoUsers: User[] = [...]

// Remove demo implementations in methods
```

**UNCOMMENT and USE these backend connections:**
```typescript
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
    tap(response => {
      this.currentUserSubject.next(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
    })
  );
}

signup(userData: SignupRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, userData).pipe(
    tap(response => {
      this.currentUserSubject.next(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
    })
  );
}

// Uncomment all other backend API calls
```

#### VehicleService (`src/app/services/vehicle.service.ts`)

**REMOVE:**
```typescript
// Remove demoVehicles array
private demoVehicles: Vehicle[] = [...]
```

**UNCOMMENT all backend API calls:**
```typescript
getVehicles(page: number = 0, size: number = 30): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
}

createVehicle(vehicleData: VehicleRequest): Observable<Vehicle> {
  const formData = new FormData();
  formData.append('vehicle', JSON.stringify({
    name: vehicleData.name,
    type: vehicleData.type,
    brand: vehicleData.brand,
    model: vehicleData.model,
    year: vehicleData.year,
    pricePerDay: vehicleData.pricePerDay,
    location: vehicleData.location,
    description: vehicleData.description,
    features: vehicleData.features
  }));
  
  vehicleData.images.forEach((image, index) => {
    formData.append('images', image);
  });
  
  return this.http.post<Vehicle>(this.apiUrl, formData);
}

// Uncomment all other methods
```

#### BookingService (`src/app/services/booking.service.ts`)

**REMOVE:**
```typescript
// Remove demoBookings array
private demoBookings: Booking[] = [...]
```

**UNCOMMENT all backend API calls:**
```typescript
createBooking(bookingData: BookingRequest): Observable<Booking> {
  return this.http.post<Booking>(this.apiUrl, bookingData);
}

getUserBookings(userId: number): Observable<Booking[]> {
  return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
}

// Uncomment all other methods
```

### 4. Add HTTP Interceptor for JWT Token

Create `src/app/interceptors/auth.interceptor.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

Update `src/main.ts`:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    importProvidersFrom(FormsModule, ReactiveFormsModule)
  ]
});
```

### 5. Update Component Files

In each component, look for comments like:
```typescript
/* Backend connection guide:
// This is the real backend code
*/

// Demo implementation - REMOVE when connecting to backend
```

**REMOVE** the demo implementation and **UNCOMMENT** the backend connection code.

### 6. Start Frontend

```bash
ng serve
```

The frontend will start on `http://localhost:4200`

## Testing the Full Application

1. Start MySQL database
2. Start backend server (`mvn spring-boot:run`)
3. Start frontend (`ng serve`)
4. Navigate to `http://localhost:4200`
5. Test login with demo credentials or create new account

## Common Issues and Solutions

### CORS Issues
If you get CORS errors, ensure the backend `SecurityConfig.java` has proper CORS configuration:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:4200"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `application.properties`
- Ensure database exists

### JWT Token Issues
- Check if token is being sent in requests
- Verify JWT secret key matches between frontend and backend
- Check token expiration time

### File Upload Issues
- Ensure multipart configuration is correct
- Check file size limits
- Verify upload directory permissions

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/signup` - User registration
- POST `/api/auth/logout` - User logout
- PUT `/api/auth/profile` - Update profile
- POST `/api/auth/change-password` - Change password

### Vehicles
- GET `/api/vehicles` - Get all vehicles (paginated)
- GET `/api/vehicles/{id}` - Get vehicle by ID
- POST `/api/vehicles` - Create new vehicle
- PUT `/api/vehicles/{id}` - Update vehicle
- DELETE `/api/vehicles/{id}` - Delete vehicle
- GET `/api/vehicles/search` - Search vehicles
- GET `/api/vehicles/user/{userId}` - Get user's vehicles

### Bookings
- POST `/api/bookings` - Create booking
- GET `/api/bookings/user/{userId}` - Get user bookings
- GET `/api/bookings/owner/{ownerId}` - Get owner bookings
- GET `/api/bookings` - Get all bookings (admin)
- PUT `/api/bookings/{id}/status` - Update booking status
- PUT `/api/bookings/{id}/cancel` - Cancel booking

This setup guide provides a complete path from demo application to fully functional backend-connected system.