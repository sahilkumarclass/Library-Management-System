package com.sahilkumar.Library.Management.System.mapper;

import com.sahilkumar.Library.Management.System.dto.response.UserResponse;
import com.sahilkumar.Library.Management.System.entity.AppUser;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(AppUser user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
