package com.easyvehiclerental.dto;

import com.easyvehiclerental.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private User.Role role;
    private LocalDateTime joinDate;
    private String profileImage;

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setJoinDate(user.getJoinDate());
        dto.setProfileImage(user.getProfileImage());
        return dto;
    }
}