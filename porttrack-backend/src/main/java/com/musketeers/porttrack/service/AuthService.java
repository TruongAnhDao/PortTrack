package com.musketeers.porttrack.service;

import com.musketeers.porttrack.dto.request.LoginRequest;
import com.musketeers.porttrack.dto.request.RegisterRequest;
import com.musketeers.porttrack.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}