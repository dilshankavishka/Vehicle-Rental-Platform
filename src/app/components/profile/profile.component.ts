import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { User } from "../../models/user.model";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;

  profileData = {
    name: "",
    email: "",
    phone: "",
  };

  passwordData = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  isUpdatingProfile = false;
  isChangingPassword = false;
  isDeletingAccount = false;
  profileUpdateSuccess = false;
  profileUpdateError = "";
  passwordChangeSuccess = false;
  passwordChangeError = "";

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileData = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone,
      };
    }
  }

  getInitials(): string {
    if (!this.currentUser?.name) return "U";
    return this.currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  updateProfile() {
    if (this.isUpdatingProfile) return;

    this.isUpdatingProfile = true;
    this.profileUpdateSuccess = false;
    this.profileUpdateError = "";

    this.authService.updateProfile(this.profileData).subscribe({
      next: (user) => {
        this.isUpdatingProfile = false;
        this.profileUpdateSuccess = true;
        this.currentUser = user;

        setTimeout(() => {
          this.profileUpdateSuccess = false;
        }, 3000);
      },
      error: (error) => {
        this.isUpdatingProfile = false;
        this.profileUpdateError = "Failed to update profile. Please try again.";
      },
    });
  }

  changePassword() {
    if (this.isChangingPassword) return;

    this.isChangingPassword = true;
    this.passwordChangeSuccess = false;
    this.passwordChangeError = "";

    this.authService
      .changePassword(
        this.passwordData.oldPassword,
        this.passwordData.newPassword
      )
      .subscribe({
        next: () => {
          this.isChangingPassword = false;
          this.passwordChangeSuccess = true;

          // Reset form
          this.passwordData = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          };

          setTimeout(() => {
            this.passwordChangeSuccess = false;
          }, 3000);
        },
        error: (error) => {
          this.isChangingPassword = false;
          this.passwordChangeError =
            "Failed to change password. Please check your current password.";
        },
      });
  }

  deleteAccount() {
    const confirmation = confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data including vehicles and bookings."
    );

    if (!confirmation) return;

    const finalConfirmation = confirm(
      'This is your final warning. Type "DELETE" in the next prompt to confirm account deletion.'
    );

    if (!finalConfirmation) return;

    const deleteConfirmation = prompt('Type "DELETE" to confirm:');
    if (deleteConfirmation !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }

    this.isDeletingAccount = true;

    if (!this.currentUser?.id) {
      //check
      this.isDeletingAccount = false;
      alert("User ID not found. Cannot delete account.");
      return;
    }
    this.authService.deleteUser(this.currentUser.id).subscribe({
      next: () => {
        this.isDeletingAccount = false;
        alert("Your account has been successfully deleted.");
        this.authService.logout();
        this.router.navigate(["/login"]);
      },
      error: (error) => {
        this.isDeletingAccount = false;
        alert("Failed to delete account. Please try again or contact support.");
      },
    });
  }
}
