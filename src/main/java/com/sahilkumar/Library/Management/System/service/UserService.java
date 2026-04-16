package com.sahilkumar.Library.Management.System.service;

import com.sahilkumar.Library.Management.System.dto.request.UserRegisterRequest;
import com.sahilkumar.Library.Management.System.dto.request.UserUpdateRequest;
import com.sahilkumar.Library.Management.System.dto.response.UserResponse;
import com.sahilkumar.Library.Management.System.entity.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    AppUser register(UserRegisterRequest req);
    Page<UserResponse> list(Pageable pageable);
    UserResponse get(Long id);
    UserResponse update(Long id, UserUpdateRequest req);
    void delete(Long id);
    AppUser findEntityByEmail(String email);
    AppUser findEntityById(Long id);
}
