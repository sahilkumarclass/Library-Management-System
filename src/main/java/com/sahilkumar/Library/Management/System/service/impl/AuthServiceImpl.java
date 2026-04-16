package com.sahilkumar.Library.Management.System.service.impl;

import com.sahilkumar.Library.Management.System.dto.request.LoginRequest;
import com.sahilkumar.Library.Management.System.dto.request.UserRegisterRequest;
import com.sahilkumar.Library.Management.System.dto.response.AuthResponse;
import com.sahilkumar.Library.Management.System.entity.AppUser;
import com.sahilkumar.Library.Management.System.service.AuthService;
import com.sahilkumar.Library.Management.System.service.JwtService;
import com.sahilkumar.Library.Management.System.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(UserRegisterRequest req) {
        AppUser user = userService.register(req);
        return buildResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        AppUser user = userService.findEntityByEmail(req.getEmail());
        return buildResponse(user);
    }

    private AuthResponse buildResponse(AppUser user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
