package com.sahilkumar.Library.Management.System.service.impl;

import com.sahilkumar.Library.Management.System.dto.request.UserRegisterRequest;
import com.sahilkumar.Library.Management.System.dto.request.UserUpdateRequest;
import com.sahilkumar.Library.Management.System.dto.response.UserResponse;
import com.sahilkumar.Library.Management.System.entity.AppUser;
import com.sahilkumar.Library.Management.System.entity.Role;
import com.sahilkumar.Library.Management.System.exception.DuplicateResourceException;
import com.sahilkumar.Library.Management.System.exception.ResourceNotFoundException;
import com.sahilkumar.Library.Management.System.mapper.UserMapper;
import com.sahilkumar.Library.Management.System.repository.UserRepository;
import com.sahilkumar.Library.Management.System.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AppUser register(UserRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + req.getEmail());
        }
        AppUser user = AppUser.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.MEMBER)
                .build();
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return userMapper.toResponse(findEntityById(id));
    }

    @Override
    public UserResponse update(Long id, UserUpdateRequest req) {
        AppUser user = findEntityById(id);
        if (!user.getEmail().equals(req.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + req.getEmail());
        }
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw ResourceNotFoundException.of("User", id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public AppUser findEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public AppUser findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return new User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
