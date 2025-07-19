package com.easyvehiclerental.controller;

import com.easyvehiclerental.dto.AuthRequest;
import com.easyvehiclerental.dto.AuthResponse;
import com.easyvehiclerental.dto.SignupRequest;
import com.easyvehiclerental.dto.UserDto;
import com.easyvehiclerental.entity.User;
import com.easyvehiclerental.service.AuthService;
import com.easyvehiclerental.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT tokens are stateless, so logout is handled on frontend
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @Valid @RequestBody User userDetails,
            Authentication authentication) {
        // Get user ID from JWT token
        String email = authentication.getName();
        UserDto updatedUser = userService.updateProfile(email, userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        userService.changePassword(email, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // Inner class for change password request
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
        
        // Getters and setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}