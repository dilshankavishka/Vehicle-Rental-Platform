import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SignupRequest } from '../../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userData: SignupRequest = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };
  
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  onSubmit() {
    if (this.isLoading || this.userData.password !== this.confirmPassword) return;
    
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.authService.signup(this.userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create account. Please try again.';
        }
      });
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Failed to create account. Please try again.';
    }
  }
}