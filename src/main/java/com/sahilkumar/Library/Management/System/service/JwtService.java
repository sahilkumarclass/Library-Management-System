package com.sahilkumar.Library.Management.System.service;

import com.sahilkumar.Library.Management.System.entity.AppUser;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(AppUser user);
    String extractEmail(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
}
