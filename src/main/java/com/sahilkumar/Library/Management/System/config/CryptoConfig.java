package com.sahilkumar.Library.Management.System.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * PasswordEncoder lives in its own config so that beans depending on it
 * (UserServiceImpl) don't transitively depend on SecurityConfig — which would
 * create a cycle: JwtAuthFilter → UserServiceImpl → SecurityConfig → JwtAuthFilter.
 */
@Configuration
public class CryptoConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
