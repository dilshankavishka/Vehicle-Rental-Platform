import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { LoginRequest } from "../../../models/user.model";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: LoginRequest = {
    email: "",
    password: "",
  };

  errorMessage = "";
  isLoading = false;

  onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = "";

    try {
      this.authService.login(this.credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.user.role === "ADMIN") {
            this.router.navigate(["/admin"]);
          } else {
            this.router.navigate(["/dashboard"]);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = "Invalid email or password";
        },
      });
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = "Invalid email or password";
    }
  }

  setDemoCredentials(email: string) {
    this.credentials.email = email;
    this.credentials.password = "password";
  }
}
