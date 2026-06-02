package com.musketeers.porttrack.dto.request;

import com.musketeers.porttrack.entity.enums.RoomStatus;
import com.musketeers.porttrack.entity.enums.RoomType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UpdateOwnerRoomRequest {
    private String name;
    private RoomType type;
    private String password;
    private BigDecimal initialBalance;
    private RoomStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
