package com.sahilkumar.Library.Management.System.service;

import com.sahilkumar.Library.Management.System.dto.request.LoginRequest;
import com.sahilkumar.Library.Management.System.dto.request.UserRegisterRequest;
import com.sahilkumar.Library.Management.System.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(UserRegisterRequest req);
    AuthResponse login(LoginRequest req);
}
