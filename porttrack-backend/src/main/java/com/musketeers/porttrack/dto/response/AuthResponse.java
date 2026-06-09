package com.musketeers.porttrack.dto.response;

import com.musketeers.porttrack.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private UserRole role;
    @Builder.Default
    private String tokenType = "Bearer";
}
