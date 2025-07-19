import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-user-management",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.css"],
})
export class UserManagementComponent implements OnInit {
  private authService = inject(AuthService);

  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = "";

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.filter((u) => u.role !== "ADMIN"); // Don't show admin users
        this.filteredUsers = [...this.users];
      },
      error: (error) => {
        console.error("Error loading users:", error);
      },
    });
  }

  filterUsers() {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.id?.toString().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  getUserBookingCount(userId: number): number {
    // Demo implementation - replace with actual booking count from backend
    return Math.floor(Math.random() * 10) + 1;
  }

  getUserVehicleCount(userId: number): number {
    // Demo implementation - replace with actual vehicle count from backend
    return Math.floor(Math.random() * 5);
  }

  deleteUser(userId: number) {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          alert("User deleted successfully");
        },
        error: (error) => {
          console.error("Error deleting user:", error);
          alert("Failed to delete user");
        },
      });
    }
  }
}
