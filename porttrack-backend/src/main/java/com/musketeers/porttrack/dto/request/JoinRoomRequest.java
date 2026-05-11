package com.musketeers.porttrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinRoomRequest {
    @NotBlank(message = "Mã phòng (Code) không được để trống")
    private String code;
    
    private String password;
}