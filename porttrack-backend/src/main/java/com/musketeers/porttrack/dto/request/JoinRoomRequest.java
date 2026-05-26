package com.musketeers.porttrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinRoomRequest {
    @NotBlank(message = "Room code is required")
    private String code;

    private String password;
}
