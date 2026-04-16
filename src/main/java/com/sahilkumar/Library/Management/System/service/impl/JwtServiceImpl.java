package com.sahilkumar.Library.Management.System.service.impl;

import com.sahilkumar.Library.Management.System.entity.AppUser;
import com.sahilkumar.Library.Management.System.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtServiceImpl(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.signingKey = resolveKey(secret);
        this.expirationMs = expirationMs;
    }

    private SecretKey resolveKey(String secret) {
        // Accept either a Base64-encoded secret or a raw string of sufficient length.
        // jjwt throws DecodingException (not IllegalArgumentException) on bad Base64,
        // so we catch broadly and fall back to UTF-8 bytes.
        try {
            byte[] decoded = Decoders.BASE64.decode(secret);
            if (decoded.length >= 32) return Keys.hmacShaKeyFor(decoded);
        } catch (RuntimeException ignored) {
            // not valid Base64 — treat the secret as a raw string
        }
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(raw);
    }

    @Override
    public String generateToken(AppUser user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getEmail())
                .claims(Map.of(
                        "uid", user.getId(),
                        "role", user.getRole().name(),
                        "name", user.getName()
                ))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    @Override
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @Override
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
}
