package com.sahilkumar.Library.Management.System.config;

import com.sahilkumar.Library.Management.System.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {

    private final UserService userService;

    public boolean isSelf(Long userId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return false;
        try {
            return userService.findEntityByEmail(auth.getName()).getId().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }
}
