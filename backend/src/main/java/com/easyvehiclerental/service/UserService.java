package com.easyvehiclerental.service;

import com.easyvehiclerental.dto.UserDto;
import com.easyvehiclerental.entity.User;
import com.easyvehiclerental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> getAllUsers() {
        return userRepository.findAllUsers()
            .stream()
            .map(UserDto::fromEntity)
            .collect(Collectors.toList());
    }

    public UserDto updateProfile(String email, User userDetails) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        
        user = userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }
        
        userRepository.deleteById(userId);
    }

    public long getUserCount() {
        return userRepository.countUsers();
    }
}