package com.easyvehiclerental.dto;

import com.easyvehiclerental.entity.User;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDto user;
}