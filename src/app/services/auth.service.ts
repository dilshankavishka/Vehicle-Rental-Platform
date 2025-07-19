import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, tap, throwError } from "rxjs";
import {
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
} from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:8080/api/auth";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.currentUserSubject.next(response.user);
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          localStorage.setItem("token", response.token);
        })
      );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, userData).pipe(
      tap((response) => {
        this.currentUserSubject.next(response.user);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();

    this.currentUserSubject.next(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "ADMIN";
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData).pipe(
      tap((updatedUser) => {
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
